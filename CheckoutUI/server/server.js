const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); // thêm axios để gửi request tới Google Sheet

const app = express();
var port = process.env.PORT || 3000;

let products = [];
let orders = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("API deployment successful");
});

// Thêm sản phẩm
app.post('/product', (req, res) => {
    const product = req.body;
    console.log(product); // debug
    products.push(product);
    res.send('Product is added to the database');
});

// Lấy toàn bộ sản phẩm
app.get('/product', (req, res) => {
    res.json(products);
});

// Lấy sản phẩm theo ID
app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    for (let product of products) {
        if (product.id === id) {
            res.json(product);
            return;
        }
    }
    res.status(404).send('Product not found');
});

// Xóa sản phẩm theo ID
app.delete('/product/:id', (req, res) => {
    const id = req.params.id;
    products = products.filter(i => i.id !== id);
    res.send('Product is deleted');
});

// Chỉnh sửa sản phẩm theo ID
app.post('/product/:id', (req, res) => {
    const id = req.params.id;
    const newProduct = req.body;
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            products[i] = newProduct;
        }
    }
    res.send('Product is edited');
});

// Xử lý thanh toán & gửi dữ liệu lên Google Sheet
app.post('/checkout', async (req, res) => {
    const order = req.body;
    orders.push(order);

    // Gửi dữ liệu lên Google Sheet qua webhook
    try {
        await axios.post("https://script.google.com/macros/s/AKfycbwiLz2_rBSishBsed_O3v2G67dX9w9pDsIRd-oF4rbR-nItH08b52IcmczQn-g1Oa8pYA/exec", order);
        console.log("✅ Gửi đơn hàng lên Google Sheet thành công!");
    } catch (err) {
        console.error("❌ Gửi Google Sheet thất bại:", err.message);
    }

    res.redirect(302, 'https://assettracker.cf');
});

// Lấy danh sách các đơn hàng đã gửi
app.get('/checkout', (req, res) => {
    res.json(orders);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
