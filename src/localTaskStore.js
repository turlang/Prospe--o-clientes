/**
 * @fileoverview Persistência local de tarefas e follow-ups com escrita serializada.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/localTaskStore
 */

/**
 * Agenda de follow-ups manuais.
 * Não envia mensagens automaticamente; apenas persiste lembretes do usuário.
 */

const path = require('node:path');
const crypto = require('node:crypto');
const Task = require('./models/Task');
const { hasMongoUri } = require('./db');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('./utils/jsonFileStore');

const TASKS_PATH = path.join(__dirname, '..', 'data', 'tasks.json');

async function readTasks() {
  const tasks = await readJsonFile(TASKS_PATH, []);
  return Array.isArray(tasks) ? tasks : [];
}

function publicTask(task) {
  return {
    id: String(task._id || task.id),
    userId: String(task.userId),
    leadId: String(task.leadId),
    leadName: task.leadName,
    title: task.title,
    dueAt: task.dueAt instanceof Date ? task.dueAt.toISOString() : task.dueAt,
    message: task.message,
    priority: task.priority || 'MÉDIA',
    automationType: task.automationType || 'MANUAL',
    done: Boolean(task.done),
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    completedAt: task.completedAt instanceof Date ? task.completedAt.toISOString() : task.completedAt
  };
}

function normalizeDueAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Data do follow-up inválida.');
  return date;
}

async function createTask({ userId, leadId, leadName, title, dueAt, message, priority = 'MÉDIA', automationType = 'MANUAL' }) {
  const dueDate = normalizeDueAt(dueAt);
  const safeTitle = String(title || 'Follow-up comercial').trim().slice(0, 180);
  const safeMessage = String(message || '').trim().slice(0, 4000);

  if (hasMongoUri()) {
    const task = await Task.create({
      userId,
      leadId: String(leadId),
      leadName: String(leadName || '').slice(0, 180),
      title: safeTitle,
      dueAt: dueDate,
      message: safeMessage,
      priority,
      automationType,
      done: false
    });
    return publicTask(task);
  }

  return withJsonFileLock(TASKS_PATH, async () => {
    const tasks = await readTasks();
    const task = {
      id: crypto.randomUUID(),
      userId: String(userId),
      leadId: String(leadId),
      leadName: String(leadName || '').slice(0, 180),
      title: safeTitle,
      dueAt: dueDate.toISOString(),
      message: safeMessage,
      priority,
      automationType,
      done: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(task);
    await writeJsonFileAtomic(TASKS_PATH, tasks);
    return task;
  });
}

async function listTasks(userId) {
  if (hasMongoUri()) {
    const tasks = await Task.find({ userId }).sort({ dueAt: 1 }).lean();
    return tasks.map(publicTask);
  }

  const tasks = await readTasks();
  return tasks
    .filter((task) => String(task.userId) === String(userId))
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

async function completeTask(userId, taskId) {
  if (hasMongoUri()) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $set: { done: true, completedAt: new Date() } },
      { new: true }
    ).lean();
    return task ? publicTask(task) : null;
  }

  return withJsonFileLock(TASKS_PATH, async () => {
    const tasks = await readTasks();
    const index = tasks.findIndex((task) => String(task.userId) === String(userId) && String(task.id) === String(taskId));
    if (index === -1) return null;
    tasks[index].done = true;
    tasks[index].completedAt = new Date().toISOString();
    await writeJsonFileAtomic(TASKS_PATH, tasks);
    return tasks[index];
  });
}

/**
 * Cria uma tarefa apenas quando não existe outra pendente com o mesmo tipo de
 * automação para o mesmo lead. Essa idempotência impede que regenerar uma
 * abordagem ou analisar a mesma resposta multiplique lembretes no painel.
 */
async function createTaskIfMissing(payload) {
  const userId = payload.userId;
  const leadId = String(payload.leadId);
  const automationType = String(payload.automationType || 'MANUAL');

  if (hasMongoUri()) {
    const existing = await Task.findOne({ userId, leadId, automationType, done: false }).sort({ createdAt: -1 }).lean();
    if (existing) return { task: publicTask(existing), created: false };
    return { task: await createTask(payload), created: true };
  }

  return withJsonFileLock(TASKS_PATH, async () => {
    const tasks = await readTasks();
    const existing = tasks.find((task) =>
      String(task.userId) === String(userId)
      && String(task.leadId) === leadId
      && String(task.automationType || 'MANUAL') === automationType
      && !task.done
    );
    if (existing) return { task: existing, created: false };

    const dueDate = normalizeDueAt(payload.dueAt);
    const task = {
      id: crypto.randomUUID(),
      userId: String(userId),
      leadId,
      leadName: String(payload.leadName || '').slice(0, 180),
      title: String(payload.title || 'Follow-up comercial').trim().slice(0, 180),
      dueAt: dueDate.toISOString(),
      message: String(payload.message || '').trim().slice(0, 4000),
      priority: payload.priority || 'MÉDIA',
      automationType,
      done: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(task);
    await writeJsonFileAtomic(TASKS_PATH, tasks);
    return { task, created: true };
  });
}

/**
 * Conclui tarefas automáticas pendentes do lead quando a etapa anterior termina.
 * Tarefas manuais são preservadas para não apagar decisões do operador.
 */
async function completePendingAutomationTasksForLead(userId, leadId, automationTypes = null) {
  const accepted = Array.isArray(automationTypes) && automationTypes.length
    ? new Set(automationTypes.map(String))
    : null;

  if (hasMongoUri()) {
    const query = {
      userId,
      leadId: String(leadId),
      done: false,
      automationType: accepted
        ? { $in: [...accepted] }
        : { $regex: '^FUNIL_' }
    };
    const result = await Task.updateMany(query, { $set: { done: true, completedAt: new Date() } });
    return Number(result.modifiedCount || 0);
  }

  return withJsonFileLock(TASKS_PATH, async () => {
    const tasks = await readTasks();
    let completed = 0;
    for (const task of tasks) {
      const isTarget = String(task.userId) === String(userId)
        && String(task.leadId) === String(leadId)
        && !task.done
        && (accepted
          ? accepted.has(String(task.automationType || 'MANUAL'))
          : String(task.automationType || '').startsWith('FUNIL_'));
      if (!isTarget) continue;
      task.done = true;
      task.completedAt = new Date().toISOString();
      completed += 1;
    }
    if (completed) await writeJsonFileAtomic(TASKS_PATH, tasks);
    return completed;
  });
}

module.exports = {
  createTask,
  createTaskIfMissing,
  completePendingAutomationTasksForLead,
  listTasks,
  completeTask,
  normalizeDueAt
};
