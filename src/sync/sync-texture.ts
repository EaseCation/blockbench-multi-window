import { listenIPC, sendIPC } from "../ipc/ipc-helper";

const textureEvents = [
    'add_texture', 'update_texture', 'remove_texture', 'update_project_resolution'
];

export function init() {
    // 注：从原始代码中看到这部分被注释掉了，这里先实现但也注释掉
    /* textureEvents.forEach(eventName => {
        Blockbench.on(eventName, () => {
            if (Project && Project.isSharing) {
                console.log("[SharedProject] 发送纹理数据...", eventName);
                syncTextureData();
            }
        });
    });

    // 监听来自其他窗口的纹理数据
    listenIPC('sync-texture-data', (data) => {
        if (!Project) return;
        if (Project.name === data.name && data['source_uuid'] !== Project.uuid) {
            console.log(`[SharedProject] 收到来自其他窗口的纹理数据更新...`, data);
            refreshTextures(data);
        }
    }); */
}

function syncTextureData() {
    if (!Project || !Project.isSharing) return;
    
    let project_data = Codecs.project.compile({
        editor_state: false,
        history: false, // 不需要复制历史记录
        uuids: true,
        bitmaps: true,
        raw: true
    });
    project_data['source_uuid'] = Project.uuid;
    delete project_data['editor_state'];
    delete project_data['elements'];
    delete project_data['outliner'];
    delete project_data['animations'];
    delete project_data['meshs'];
    
    // 通过IPC发送到主进程
    sendIPC('sync-texture-data', project_data);
}

function refreshTextures(model: any) {
    if (!Project) return;
    // 保存当前项目状态的重要部分
    const currentUUID = Project.uuid;
    const currentName = Project.name;
    const currentSelection = {
        elements: Project.selected_elements.slice(),
        groups: Project.selected_group
    };

    // 清除当前纹理数据，但保留项目结构
    Blockbench.dispatchEvent('pre_refresh_project');

    Texture.all.forEach(texture => {
        texture.remove(false);
    });
    Texture.all = [];
    
    // 恢复项目属性
    Project.uuid = currentUUID;
    Project.name = currentName;

    // 尝试恢复选择（如果元素UUID匹配）
    /* if (currentSelection.elements.length) {
        Project.selected_elements = Outliner.elements.filter(element =>
            currentSelection.elements.find(sel => sel.uuid === element.uuid)
        );
    } */

    // 更新界面
    Canvas.updateAll();
    Blockbench.dispatchEvent('post_refresh_project');
}
