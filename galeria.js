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
projects.forEach(p=>{const a=document.createElement('a');a.href='?project='+p.id;a.textContent=p.title;if(p.id===project.id)a.setAttribute('aria-current','page');nav.append(a);});
