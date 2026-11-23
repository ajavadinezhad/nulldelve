/** Firing is a deliberate walking stance; release Fire to sprint out of danger. */
export function operatorMoveSpeed({grabbed=false,sprint=false,firing=false,sprintMultiplier=1}={}){return grabbed?2.4:sprint&&!firing?6*Math.max(1,Math.min(1.15,sprintMultiplier)):4;}
