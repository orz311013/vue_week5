import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.19/vue.esm-browser.min.js';

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'orzorzorz';

// Object.keys(VeeValidateRules).forEach((rule) => {
//     VeeValidate.defineRule(rule, VeeValidateRules[rule]);
// });
//引入自己需要的
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

//元件Modal
const userModal = {
    props: ['tempProduct', 'addToCart'],
    data() {
        return {
            productModal: null,
            qty: 1,
        };
    },
    methods: {
        open() {
            this.productModal.show();
        },
        close() {
            this.productModal.hide();
        },
    },
    //監聽tempProduct值是否有變化
    watch: {
        tempProduct() {
            this.qty = 1;
        },
    },
    template: `#userProductModal`,
    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal);
    },
};

const app = createApp({
    data() {
        return {
            products: [],
            tempProduct: {},
            carts: {},
            status: {
                addCartLoading: '',
                cartQtyLoading: '',
            },
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message: '',
            },
        };
    },
    //註冊元件
    components: {
        userModal,
    },

    methods: {
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`).then((res) => {
                // console.log(res);
                this.products = res.data.products;
            });
        },
        openModal(product) {
            this.tempProduct = product;
            this.$refs.userModal.open();
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/;
            return phoneNumber.test(value) ? true : '需要正確的電話號碼';
        },
        onSubmit() {
            console.log(this.user);
        },
        addToCart(product_id, qty = 1) {
            //參數預設
            const order = {
                product_id,
                qty,
            };
            // 區域loading
            this.status.addCartLoading = product_id;

            axios
                .post(`${apiUrl}/api/${apiPath}/cart`, { data: order })
                .then((res) => {
                    console.log(res);
                    this.status.addCartLoading = '';
                    this.getCart();
                    this.$refs.userModal.close();
                });
        },
        changeCartQty(item, qty = 1) {
            const order = {
                product_id: item.product_id,
                qty,
            };
            this.status.cartQtyLoading = item.id;

            axios
                .put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data: order })
                .then((res) => {
                    console.log(res);
                    this.status.cartQtyLoading = '';
                    this.getCart();
                });
        },
        removeCartItem(id) {
            this.status.cartQtyLoading = id;
            axios
                .delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
                .then((res) => {
                    console.log(res);
                    this.status.cartQtyLoading = '';
                    this.getCart();
                });
        },


        getCart() {
            axios.get(`${apiUrl}/api/${apiPath}/cart`).then((res) => {
                console.log(res);
                this.carts = res.data.data;
                console.log(this.carts);
            });
        },
    },
    mounted() {
        this.getProducts();
        this.getCart();
    },
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
app.mount('#app');
