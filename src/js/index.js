// TODO step3 서버 요청 부분
// [x]웹 서버를 띄운다.
// [x]서버에 새로운 메뉴명이 추가될 수 있도록 요청한다.
// []서버에 카테고리별 메뉴리스트를 불러온다.
// []서버에 메뉴가 수정 될 수 있도록 요청한다.
// []서버에 메뉴의 품절상태를 변경(토글)할수 있도록 요청한다.
// []서버에 메뉴가 삭제될수 있도록 요청한다.

// TODO 리팩토링 부분
// []localStorage에 저장하는 로직은 지운다.
// []fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.

// TODO 사용자 경험
// []API 통신이 실패하는 경우에 대해 사용자가 알 수 있게 alert으로 예외처리를 진행한다.
// []중복되는 메뉴는 추가할 수 없다.

const BASE_URL = "http://localhost:3000/api";

import {$} from './utils/dom.js'
import store from './store/index.js';

function App() {
    const menuForm = $('#menu-form');
    const idMenuName = $('#menu-name');
    const submitBtn = $('#menu-submit-button');
    const menuList = $('#menu-list');
    this.menu = {
        espresso: new Array(),
        frappuccino: new Array(),
        blended: new Array(),
        teavana: new Array(),
        desert: new Array()
    };
    this.currentCategory = 'espresso';

    this.init = (name) => {
        const message = store.getLocalStorage(name)
        if(message){
            this.menu = message;
        }
        render();
        initEventListeners();
    };
    
    const render = () => {
        const template = this.menu[this.currentCategory].map((item) => {
            return`<li data-menu-id='${item.id}' class="menu-list-item d-flex items-center py-2">
                    <span class="w-100 pl-2 menu-name ${item.soldOut ? 'sold-out' : ''}">${item.name}</span>
                    <button type="button" class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"> 품절 </button>
                    <button type="button" class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"> 수정 </button>
                    <button type="button" class="bg-gray-50 text-gray-500 text-sm menu-remove-button"> 삭제 </button>
                    </li>`;
            }).join('');
        menuList.innerHTML = template;
        commonUpdateMenuCount();
    };

    const commonUpdateMenuCount = () => {
        const menuCount = this.menu[this.currentCategory].length;
        $('.menu-count').innerText = `총 ${menuCount} 개`;
    };
    const commonAddMenuName = () => {
        if(idMenuName.value === ''){
            alert('값을 입력해주세요.');
            return;
        }
        const menuName = idMenuName.value;
        fetch(`${BASE_URL}/category/${this.currentCategory}/menu`, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({name: menuName})
        }).then((res) => {
            return res.json();
        }).then((data) => {
            console.log(data)
        })
        //this.menu[this.currentCategory].push({id:Date.now(), name:menuName});
        store.setLocalStorage('menu',this.menu);
        render();
        idMenuName.value = "";
    };

    const updateMenuName = (e) => {
        const menuId = e.target.closest('li').dataset.menuId;
        const menuName = e.target.closest('li').querySelector('.menu-name');
        const updateMenuName = prompt('메뉴명을 수정하세요', menuName.innerText);
        this.menu[this.currentCategory].forEach((el, idx) => {  
            if(this.menu[this.currentCategory][idx].id === parseInt(menuId)){ // this.menu에 있는 배열에 ID와, DOM에 있는 ID를 비교하여 일치하는지 여부 체크
                this.menu[this.currentCategory][idx].name = updateMenuName // this.menu에 있는 배열을 돌면서 name값을 update 합니다.
            }
        });
        store.setLocalStorage('menu',this.menu);
        render();
    };

    const removeMenuName = (e) => {
        const menuId = e.target.closest('li').dataset.menuId;
        if(confirm('정말 삭제하시겠습니까?')){
            const idx = this.menu[this.currentCategory].findIndex(function(item) {return item.id === parseInt(menuId)}) // this.menu에 있는 배열과 li에 있는 data-menu-Id에 일차하는 인텍스값 리턴
            this.menu[this.currentCategory].splice(idx, 1);
            store.setLocalStorage('menu',this.menu);
            render();
        }
    }

    const soldOutMenu = (e) => {
        const menuId = parseInt(e.target.closest('li').dataset.menuId);
        this.menu[this.currentCategory].forEach((el, idx) => {
            if(this.menu[this.currentCategory][idx].id === menuId){
                this.menu[this.currentCategory][idx].soldOut = !this.menu[this.currentCategory][idx].soldOut; //undefined(기본적으로 Falsy한 값)에 느낌표를 붙여주면 true 로전환됩니다.그래서 토글기능이 가능해집니다.
            }
        });
        store.setLocalStorage('menu',this.menu);
        render();
    }

    const initEventListeners = () => {
        menuList.addEventListener('click', (e) => {
            if(e.target.classList.contains('menu-edit-button')){
                updateMenuName(e);
                return;
            }
    
            if(e.target.classList.contains('menu-remove-button')){
                removeMenuName(e);
                return;
            }
    
            if(e.target.classList.contains('menu-sold-out-button')){
                soldOutMenu(e);
                return;
            }
        });
    
        menuForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    
        submitBtn.addEventListener('click', commonAddMenuName);
        
        idMenuName.addEventListener('keypress', (e) => {
            if(e.key !== 'Enter') return;
            commonAddMenuName();
        });
    
        $('nav').addEventListener('click', (e) => {
            const isCategoryBtn = e.target.classList.contains('cafe-category-name');
            if(isCategoryBtn){
                const catagoryName = e.target.dataset.categoryName;
                this.currentCategory = catagoryName;
                $('#category-title').innerText = `${e.target.innerText} 메뉴 관리`;
            }
            render();
        });
    };
}
const app = new App();
app.init('menu');