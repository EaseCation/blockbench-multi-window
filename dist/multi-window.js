(()=>{"use strict";const e=new Action("open_in_new_window",{icon:"file_copy",name:"在另一窗口打开",description:"在另一窗口打开",category:"file",condition:()=>isApp&&!!Project,click:function(){if(!Project)return;let e=Codecs.project.compile({editor_state:!0,history:!1,uuids:!0,bitmaps:!0,raw:!0});Project.isSharing=!0,ipcRenderer.send("new-window",JSON.stringify(e))}});function n(e,n){isApp?(n.__magic__=e,ipcRenderer.send("dragging-tab",JSON.stringify(n))):console.warn("[SharedProject] 发送数据失败，当前不是应用程序环境")}const o={};function t(e,n){o[e]=n}const i=["add_cube","add_mesh","add_group","add_texture_mesh","update_keyframe","group_elements","finish_edit","undo","redo","change_color","update_project_settings","remove_animation","edit_animation_properties","change_texture_path","load_undo_save","merge_project"];const a=["update_selection"];function c(){i.forEach((e=>{Blockbench.on(e,(()=>{if(Project&&Project.isSharing){console.log("[SharedProject] 发送数据...",e);let o=Codecs.project.compile({editor_state:!0,history:!1,uuids:!0,bitmaps:!0,raw:!0});o.source_uuid=Project.uuid,delete o.editor_state,n("sync-shared-data",o)}}))})),t("sync-shared-data",(e=>{Project&&Project.name===e.name&&e.source_uuid!==Project.uuid&&(console.log("[SharedProject] 收到来自其他窗口的完整数据更新...",e),function(e){var n,o;if(!Project)return;const t=Project.uuid,i=Project.name;if(Project.selected_elements.slice(),Project.selected_group,Blockbench.dispatchEvent("pre_refresh_project"),Mesh.all.forEach((e=>{e.remove()})),Mesh.all=[],Group.all.forEach((e=>{e.remove(!1)})),Group.all=[],Texture.all.forEach((e=>{e.remove(!1)})),Texture.all=[],Blockbench.Animation.all.forEach((e=>{e.remove(!1,!0)})),Blockbench.Animation.all=[],AnimationController.all.forEach((e=>{e.remove(!1)})),AnimationController.all=[],Codecs.project.parse(e,(null===(n=e.editor_state)||void 0===n?void 0:n.save_path)||"",!0),Project.uuid=t,Project.name=i,e.animations){const n=e.animations.find((e=>e.selected));n&&(null===(o=Blockbench.Animation.all.find((e=>e.name===n.name)))||void 0===o||o.select())}Canvas.updateAll(),Blockbench.dispatchEvent("post_refresh_project")}(e))})),a.forEach((e=>{Blockbench.on(e,(()=>{Project&&Project.isSharing&&(console.log("[SharedProject] 发送模型数据...",e),function(){if(!Project||!Project.isSharing)return;let e=Codecs.project.compile({editor_state:!1,history:!1,uuids:!0,bitmaps:!1,raw:!0});e.source_uuid=Project.uuid,delete e.editor_state,delete e.textures,n("sync-model-data",e)}())}))})),t("sync-model-data",(e=>{Project&&Project.name===e.name&&e.source_uuid!==Project.uuid&&(console.log("[SharedProject] 收到来自其他窗口的模型数据更新...",e),function(e){var n;if(!Project)return;const o=Project.uuid,t=Project.name;Blockbench.dispatchEvent("pre_refresh_project"),Mesh.all.forEach((e=>{e.remove()})),Mesh.all=[],Group.all.forEach((e=>{e.remove(!1)})),Group.all=[],Blockbench.Animation.all.forEach((e=>{e.remove(!1,!0)})),Blockbench.Animation.all=[],Codecs.project.parse(e,(null===(n=e.editor_state)||void 0===n?void 0:n.save_path)||"",!0),Project.uuid=o,Project.name=t,Canvas.updateAll(),Blockbench.dispatchEvent("post_refresh_project")}(e))})),Blockbench.on("display_animation_frame",(()=>{const e=Blockbench.Animation.selected;Project&&Project.isSharing&&e&&!Timeline.playing&&n("sync-animation-frame",{project_name:Project.name,animation_name:e.name,time:Timeline.time})})),["timeline_play","timeline_pause"].forEach((e=>{Blockbench.on(e,(()=>{const e=Blockbench.Animation.selected;Project&&Project.isSharing&&e&&n("sync-animation-timeline",{project_name:Project.name,animation_name:e.name,animations:Blockbench.Animation.all.map((e=>({name:e.name,playing:e.playing,time:e.time}))),playing:Timeline.playing,time:Timeline.time})}))})),t("sync-animation-frame",(e=>{Project&&Project.name===e.project_name&&Blockbench.Animation.selected&&Blockbench.Animation.selected.name===e.animation_name&&!Timeline.playing&&(Timeline.setTime(e.time),Timeline.pause())})),t("sync-animation-timeline",(e=>{Project&&Project.name===e.project_name&&(e.animations.forEach((n=>{const o=Blockbench.Animation.all.find((e=>e.name===n.name));e.animation_name===n.name&&(null==o||o.select()),o&&(o.playing=n.playing)})),e.playing?(Timeline.setTime(e.time),Timeline.start()):(Timeline.setTime(e.time),Timeline.pause()))}))}Plugin.register("multi-window",{name:"Multi Window",author:"EaseCation",description:"为BlockBench实现多窗口同步",version:"1.0.0",variant:"desktop",onload(){MenuBar.addAction(e,"file.8"),c(),setTimeout((()=>{ipcRenderer.removeAllListeners("accept-detached-tab"),ipcRenderer.on("accept-detached-tab",((e,n)=>{if("__magic__"in n){const e=n.__magic__;console.log("[SharedProject] 收到数据...",e,n),e in o?(0,o[e])(n):console.warn("[SharedProject] 收到未知magic数据...",e,n)}else console.log("[SharedProject] 收到无magic数据...",n),Interface.page_wrapper.classList.toggle("accept_detached_tab",n)}))}),500)},onunload(){MenuBar.removeAction("file.open_in_new_window")}})})();