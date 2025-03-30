export function sendIPC(magic: string, data: any) {
    if (isApp) {
        data['__magic__'] = magic;
        ipcRenderer.send('dragging-tab', JSON.stringify(data));
    } else {
        console.warn("[SharedProject] 发送数据失败，当前不是应用程序环境");
    }
}

const listening: { [magic: string]: (data: any) => void } = {}

export function listenIPC(magic: string, handler: (data: any) => void) {
    listening[magic] = handler;
}

export function init() {
    ipcRenderer.removeAllListeners('accept-detached-tab');
    ipcRenderer.on('accept-detached-tab', (event, data) => {
        if ('__magic__' in data) {
            // 处理magic
            const magic = data['__magic__'];
            console.log("[SharedProject] 收到数据...", magic, data);
            if (magic in listening) {
                const handler = listening[magic];
                handler(data);
            } else {
                console.warn("[SharedProject] 收到未知magic数据...", magic, data);
            }
        } else {
            // 执行原版逻辑
            console.log("[SharedProject] 收到无magic数据...", data);
            Interface.page_wrapper.classList.toggle('accept_detached_tab', data);
        }
    });
}