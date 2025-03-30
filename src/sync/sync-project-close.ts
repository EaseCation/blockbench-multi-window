import { listenIPCMagic, sendIPCMagic } from '../ipc/ipc-magic';

export function init() {
    // 监听项目关闭事件
    Blockbench.on('close_project', () => {
        if (!Project) return;
        if (Project.isSharing) {
            console.log("[SharedProject] 发送关闭窗口事件...", Project.name);
            // 通过IPC发送到主进程
            sendIPCMagic('sharing-project-close', { name: Project.name });
        }
    });
    // 监听关闭窗口事件
    listenIPCMagic('sharing-project-close', (data) => {
        if (!Project) return;
        console.log("[SharedProject] 收到关闭窗口事件...", data);
        if (Project.isSharingClient && Project.name === data.name) {
            Project.locked = false;
            Project.close(true);
            window.close();
        }
    });
}