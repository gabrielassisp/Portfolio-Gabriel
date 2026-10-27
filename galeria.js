import {projects,accessLabel} from './demos/projects.js';
import {captures} from './imagens/projetos/captures.js';
const id=new URLSearchParams(location.search).get('project');
const project=projects.find(p=>p.id===id)||projects[0];
const capture=captures[project.id];
document.title=project.title+' · Capturas | Gabriel Assis';
document.getElementById('gallery-title').textContent=project.title;
document.getElementById('gallery-description').textContent=capture.label;
const image=document.getElementById('gallery-image');
image.src='imagens/projetos/'+capture.file;image.alt=capture.label;
document.getElementById('gallery-full').href=image.src;
document.getElementById('gallery-caption').textContent=capture.caption;
const actions=document.getElementById('gallery-actions');
for(const [href,label,external] of [['projetos/'+project.page,'Estudo completo',false],['https://github.com/gabrielassisp/'+project.repo,accessLabel(project),true]]){const a=document.createElement('a');a.href=href;a.textContent=label;if(external){a.target='_blank';a.rel='noopener noreferrer';}actions.append(a);}
const nav=document.getElementById('gallery-projects');
projects.filter(p=>!['comercial','churn'].includes(p.id)).forEach(p=>{const a=document.createElement('a');a.href='?project='+p.id;a.textContent=p.title;if(p.id===project.id)a.setAttribute('aria-current','page');nav.append(a);});
import {codeExamples} from './imagens/projetos/code-examples.js';
const example=codeExamples[project.id];
document.getElementById('code-title').textContent=example.title;
document.getElementById('code-explanation').textContent=example.explanation;
document.getElementById('code-language').textContent=example.language+(example.startLine?' · a partir da linha '+example.startLine:'');
document.getElementById('code-content').textContent=example.code;
document.getElementById('code-original').href=example.href;
document.getElementById('code-source').textContent='Fonte: '+example.source;
const tabs=[document.getElementById('image-tab'),document.getElementById('code-tab')];
function selectTab(code,focus=false){tabs.forEach((tab,i)=>{const active=(i===1)===code;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});document.getElementById('gallery-images').hidden=code;document.getElementById('gallery-code').hidden=!code;document.getElementById('image-note').hidden=code;if(focus)tabs[code?1:0].focus();const url=new URL(location.href);url.searchParams.set('view',code?'code':'images');history.replaceState(null,'',url);}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(i===1));tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectTab(e.key==='Home'?false:e.key==='End'?true:i===0,true);}});});
selectTab(new URLSearchParams(location.search).get('view')==='code');
