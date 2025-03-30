export function init() {
    // 新窗口打开时，自动初始化分屏
    ipcRenderer.on('load-tab', (event, model) => {
        setTimeout(() => {
            if (!Project) return;
            if (Project.name === model.name && model.splitMode) {
                Project.locked = true;
                Interface.toggleSidebar('left', false);
                Interface.toggleSidebar('right', false);
                const tabBar = document.getElementById('tab_bar');
                if (tabBar) {
                    // 隐藏dom
                    tabBar.style.display = 'none';
                }
                Project.isSharingClient = true;
            }
        }, 100);
    });
}

/**
 * 通过IPC尝试打开一个新的窗口，并打开项目
 * @param project_data 编译后项目数据
 */
export function openNewWindow(project_data: any) {
    ipcRenderer.send('new-window', JSON.stringify(project_data));
}