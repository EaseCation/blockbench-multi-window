// 添加BlockBench Plugin类型声明，避免与DOM的Plugin类型冲突
declare namespace BBPlugin {
    interface PluginOptions {
        name: string;
        author: string;
        description: string;
        version: string;
        variant: string;
        onload?: () => void;
        onunload?: () => void;
        [key: string]: any;
    }
    
    interface PluginAPI {
        register: (id: string, options: PluginOptions) => any;
    }
}

declare const Plugin: BBPlugin.PluginAPI;

import { openInNewWindowAction } from './menu/open-in-new-window';
import { init as initSync } from './sync/sync';
import { init as initIPC } from './ipc/ipc-helper';

/**
 * 注册插件
 */
export function registerPlugin(): void {
    Plugin.register('multi-window', {
        name: 'Multi Window',
        author: 'EaseCation',
        description: '为BlockBench实现多窗口同步',
        version: '1.0.0',
        variant: 'desktop',
        onload() {
            // 注册MenuBar
            MenuBar.addAction(openInNewWindowAction, 'file.8');
            // 注册各种IPC同步
            initSync();
            // magic的ipc监听
            setTimeout(() => {
                initIPC();
            }, 500);
        },
        onunload() {
            MenuBar.removeAction('file.open_in_new_window');
        }
    });
}
