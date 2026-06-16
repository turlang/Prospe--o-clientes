/**
 * localTaskStore.js
 * -----------------------------------------------------------------------------
 * Agenda de follow-ups manuais.
 *
 * - Com MongoDB conectado: grava na collection Task.
 * - Sem MongoDB: usa data/tasks.json para desenvolvimento local.
 *
 * Não envia mensagens automaticamente. Apenas registra lembretes para o usuário.
 */

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const Task = require('./models/Task');
const { hasMongoUri } = require('./db');

const TASKS_PATH = path.join(__dirname, '..', 'data', 'tasks.json');

async function readTasks() {
  try {
    return JSON.parse(await fs.readFile(TASKS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

async function writeTasks(tasks) {
  await fs.mkdir(path.dirname(TASKS_PATH), { recursive: true });
  await fs.writeFile(TASKS_PATH, JSON.stringify(tasks, null, 2));
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
    done: Boolean(task.done),
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    completedAt: task.completedAt instanceof Date ? task.completedAt.toISOString() : task.completedAt
  };
}

async function createTask({ userId, leadId, leadName, title, dueAt, message }) {
  if (hasMongoUri()) {
    const task = await Task.create({
      userId,
      leadId: String(leadId),
      leadName,
      title: title || 'Follow-up comercial',
      dueAt: new Date(dueAt),
      message: message || '',
      done: false
    });

    return publicTask(task);
  }

  const tasks = await readTasks();
  const task = {
    id: crypto.randomUUID(),
    userId: String(userId),
    leadId: String(leadId),
    leadName,
    title,
    dueAt,
    message,
    done: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  await writeTasks(tasks);
  return task;
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

  const tasks = await readTasks();
  const index = tasks.findIndex((task) => String(task.userId) === String(userId) && String(task.id) === String(taskId));
  if (index === -1) return null;
  tasks[index].done = true;
  tasks[index].completedAt = new Date().toISOString();
  await writeTasks(tasks);
  return tasks[index];
}

module.exports = { createTask, listTasks, completeTask };
