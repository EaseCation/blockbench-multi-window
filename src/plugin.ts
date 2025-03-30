import { openInNewWindowAction } from './menu/open-in-new-window';
import { init as initSync } from './sync/sync';
import { init as initIPC } from './ipc/ipc-helper';

/**
 * 注册插件
 */
export function registerPlugin(): void {
    BBPlugin.register('multi-window', {
        title: tl('multi_window.name'),
        author: 'EaseCation',
        icon: 'window',
        description: tl('multi_window.description'),
        version: '1.0.0',
        variant: 'desktop',
        onload() {
            // 注册语言
            registerLanguage();
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

export function registerLanguage(): void {
    //en
    Language.addTranslations('en', {
        'multi_window.name': 'Multi Window',
        'multi_window.description': 'Multi Window with Sync',
        'action.open_in_new_window': 'Split to New Window',
        'action.open_in_new_window.desc': 'Open the current project in a new window',
    });
    //zh
    Language.addTranslations('zh', {
        'multi_window.name': '多窗口',
        'multi_window.description': '在BlockBench实现多窗口同步',
        'action.open_in_new_window': '分屏到新窗口',
        'action.open_in_new_window.desc': '在新窗口中打开当前项目',
    });
    //zh-Hans
    Language.addTranslations('zh-Hans', {
        'multi_window.name': '多窗口',
        'multi_window.description': '在BlockBench实现多窗口同步',
        'action.open_in_new_window': '分屏到新窗口',
        'action.open_in_new_window.desc': '在新窗口中打开当前项目',
    });
    //zh-Hant
    Language.addTranslations('zh-Hant', {
        'multi_window.name': '多窗口',
        'multi_window.description': '在BlockBench實現多窗口同步',
        'action.open_in_new_window': '分屏到新窗口',
        'action.open_in_new_window.desc': '在新窗口中打開當前項目',
    });
    //ja
    Language.addTranslations('ja', {
        'multi_window.name': 'マルチウィンドウ',
        'multi_window.description': 'BlockBenchでのマルチウィンドウ同期',
        'action.open_in_new_window': '新しいウィンドウで分割',
        'action.open_in_new_window.desc': '現在のプロジェクトを新しいウィンドウで開く',
    });
    //ko
    Language.addTranslations('ko', {
        'multi_window.name': '다중 창',
        'multi_window.description': 'BlockBench에서 다중 창 동기화',
        'action.open_in_new_window': '새 창으로 분할',
        'action.open_in_new_window.desc': '현재 프로젝트를 새 창에서 엽니다',
    });
    //fr
    Language.addTranslations('fr', {
        'multi_window.name': 'Multi Fenêtre',
        'multi_window.description': 'Synchronisation Multi Fenêtre dans BlockBench',
        'action.open_in_new_window': 'Diviser dans une Nouvelle Fenêtre',
        'action.open_in_new_window.desc': 'Ouvrir le projet actuel dans une nouvelle fenêtre',
    });
    //de
    Language.addTranslations('de', {
        'multi_window.name': 'Mehrere Fenster',
        'multi_window.description': 'BlockBench mit mehreren Fenstern synchronisieren',
        'action.open_in_new_window': 'In Neues Fenster teilen',
        'action.open_in_new_window.desc': 'Das aktuelle Projekt in einem neuen Fenster öffnen',
    });
    //es
    Language.addTranslations('es', {
        'multi_window.name': 'Ventana Múltiple',
        'multi_window.description': 'Sincronización de Ventanas Múltiples en BlockBench',
        'action.open_in_new_window': 'Dividir en Nueva Ventana',
        'action.open_in_new_window.desc': 'Abrir el proyecto actual en una nueva ventana',
    });
    //pt
    Language.addTranslations('pt', {
        'multi_window.name': 'Janela Múltipla',
        'multi_window.description': 'Sincronização de Várias Janelas no BlockBench',
        'action.open_in_new_window': 'Dividir em Nova Janela',
        'action.open_in_new_window.desc': 'Abrir o projeto atual em uma nova janela',
    });
}