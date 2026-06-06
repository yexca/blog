/*!
*   Hugo Theme Stack
*
*   @author: Jimmy Cai
*   @website: https://jimmycai.com
*   @link: https://github.com/CaiJimmy/hugo-theme-stack
*/
import createElement from 'ts/createElement';
import { initOnce } from "ts/core/initOnce";
import { initPage } from "ts/core/pageInit";

const Stack = {
    globalInit: initOnce,
    init: initPage,
};

window.addEventListener('load', () => {
    setTimeout(function () {
        Stack.globalInit();
        Stack.init();
    }, 0);
})

declare global {
    interface Window {
        createElement: any;
        Stack: any
    }
}

window.Stack = Stack;
window.createElement = createElement;
