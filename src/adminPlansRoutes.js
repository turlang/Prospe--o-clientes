
const express=require('express');
const router=express.Router();
const {getPlans,savePlans}=require('./planStore');

router.get('/api/admin/plans',(req,res)=>res.json(getPlans()));

router.put('/api/admin/plans/:id',(req,res)=>{
 const plans=getPlans();
 plans[req.params.id]={...(plans[req.params.id]||{}),...req.body};
 savePlans(plans);
 res.json({success:true,plan:plans[req.params.id]});
});

module.exports=router;
