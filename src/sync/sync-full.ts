import { listenIPCMagic, sendIPCMagic } from "../ipc/ipc-magic";

const syncEvents = [
    'add_cube', 'add_mesh', 'add_group', 'add_texture_mesh',
    'update_keyframe', 'group_elements',
    'finish_edit', 'undo', 'redo', 'change_color',
    'update_project_settings',
    'remove_animation', 'edit_animation_properties', 'change_texture_path',
    'load_undo_save', 'merge_project'
];

export function init() {
    syncEvents.forEach(eventName => {
        Blockbench.on(eventName, () => {
            if (Project && Project.isSharing) {
                console.log("[SharedProject] 发送数据...", eventName);
                let project_data = Codecs.project.compile({
                    editor_state: true,
                    history: false, // 不需要复制历史记录
                    uuids: true,
                    bitmaps: true,
                    raw: true
                });
                project_data['source_uuid'] = Project.uuid;
                delete project_data['editor_state'];
                // 通过IPC发送到主进程
                sendIPCMagic('sync-shared-data', project_data);
            }
        });
    });

    listenIPCMagic('sync-shared-data', (data) => {
        if (!Project) return;
        if (Project.name === data.name && data['source_uuid'] !== Project.uuid) {
            console.log(`[SharedProject] 收到来自其他窗口的完整数据更新...`, data);
            refreshFullProject(data);
        }
    });
}

function refreshFullProject(model: any) {
    if (!Project) return;
    // 保存当前项目状态的重要部分
    const currentUUID = Project.uuid;
    const currentName = Project.name;
    const currentSelection = {
        elements: Project.selected_elements.slice(),
        groups: Project.selected_group
    };

    // 清除当前模型数据，但保留项目结构
    Blockbench.dispatchEvent('pre_refresh_project');

    Mesh.all.forEach(mesh => {
        mesh.remove();
    });
    Mesh.all = [];
    Group.all.forEach(group => {
        group.remove(false);
    });
    Group.all = [];
    Texture.all.forEach(texture => {
        texture.remove(false);
    });
    Texture.all = [];
    Blockbench.Animation.all.forEach(animation => {
        animation.remove(false, true);
    });
    Blockbench.Animation.all = [];
    AnimationController.all.forEach(controller => {
        controller.remove(false);
    });
    AnimationController.all = [];
    //@ts-ignore
    Codecs.project.parse(model, model.editor_state?.save_path || '', true);

    // 恢复项目属性
    Project.uuid = currentUUID;
    Project.name = currentName;

    // 尝试恢复选择（如果元素UUID匹配）
    /* if (currentSelection.elements.length) {
        Project.selected_elements = Outliner.elements.filter(element =>
            currentSelection.elements.find(sel => sel.uuid === element.uuid)
        );
    } */

    // 尝试更新当前动画选择
    if (model.animations) {
        const selectedAnimation = model.animations.find((animation: any) => animation.selected);
        if (selectedAnimation) {
            Blockbench.Animation.all.find(animation => animation.name === selectedAnimation.name)?.select();
        }
    }

    // 更新界面
    Canvas.updateAll();
    Blockbench.dispatchEvent('post_refresh_project');
}
