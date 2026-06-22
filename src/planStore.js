
const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'data','plans.json');

function getPlans(){
 return JSON.parse(fs.readFileSync(file,'utf8'));
}
function savePlans(plans){
 fs.writeFileSync(file,JSON.stringify(plans,null,2));
}
module.exports={getPlans,savePlans};
