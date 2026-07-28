window.LGMK_DATA=(function(){
const C=window.LGMK_CORE,L=window.LGMK_LANGUAGE,A=window.LGMK_LEARNING;
return{
 officialRequirements:C.req,
 programme:C.sem.map(x=>({semester:x[0],title:x[1],status:x[2],courses:x[3],outputs:x[4]})),
 courses:C.crs.map(x=>({id:x[0],title:x[1],level:x[2],area:x[3],outcome:x[4],units:x[5],statutes:x[6],books:x[7],practice:x[8]})),
 books:C.bks.map(x=>({cat:x[0],title:x[1],author:x[2],level:x[3],use:x[4],note:x[5]})),
 resources:C.res.map(x=>({title:x[0],kind:x[1],use:x[2],url:x[3]})),
 currentOffers:C.now.map(x=>({term:x[0],title:x[1],time:x[2],note:x[3]})),
 vocab:L.voc.map(x=>({term:x[0],plural:x[1],fa:x[2],coll:x[3],example:x[4],area:x[5],law:x[6]})),
 sentences:L.sen.map(x=>({cat:x[0],de:x[1],fa:x[2]})),
 readings:A.rd.map(x=>({id:x[0],title:x[1],level:x[2],area:x[3],de:x[4],fa:x[5],questions:x[6]})),
 cases:A.cas.map(x=>({id:x[0],title:x[1],area:x[2],facts:x[3],question:x[4],norms:x[5],checks:x[6],model:x[7]})),
 quiz:A.qz.map(x=>({q:x[0],options:x[1],answer:x[2],explanation:x[3]})),
 researchSteps:A.rs.map(x=>({id:x[0],title:x[1],desc:x[2],output:x[3]}))
};
})();
