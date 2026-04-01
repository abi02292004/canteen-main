const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let currentCount = 0;
let orders = [];
// 🔥 memory storage

// API to update crowd count from camera
app.post('/api/crowd/update', (req, res) => {
    currentCount = req.body.count;
    res.json({ success: true });
});

// API to send crowd count to dashboard
app.get('/api/crowd/live', (req, res) => {
    res.json({ count: currentCount });
});

// server.js kulla idhu irukkanum
app.get('/api/orders/count', (req, res) => {
    // Orders list-oda length-a anuppuvom
    res.json({ count: orders.length });
});


// 1. Dashboard asks: "What is the status?"
app.get('/api/sync/all', (req, res) => {
    res.json({
        count: currentCount,
        totalOrders: orders.length,
        lastOrder: orders.length > 0 ? orders[orders.length - 1] : null
    });
});

// 🧠 SINGLE MEMORY (ONLY ONE!)


// ✅ RECEIVE ORDER
app.post('/api/orders', (req, res) => {
    const newOrder = {
        id: req.body.id || "ORD-" + Math.floor(Math.random() * 9000),
        studentId: req.body.studentId || "Student",
        items: req.body.items || [],
        total: req.body.total || 0,
        status: "Pending", // 🔥 NEW FIELD
        date: new Date().toISOString().split('T')[0]
    };

    orders.push(newOrder);

    console.log("✅ NEW ORDER:", newOrder);

    res.json({ success: true });
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// ✅ SEND TO ADMIN
app.get('/api/sync/all', (req, res) => {
    res.json({
        orders: orders,
        totalOrders: orders.length
    });
});


// 🧠 THE SHARED MEMORY: Persistent List
let studentOrders = [];

// A. RECEIVER: Student "+" click panna terminal-la msg vara:
app.post('/api/orders', (req, res) => {
    const newOrder = {
        id: req.body.id || "ORD-" + Math.floor(Math.random() * 9000),
        studentId: req.body.studentId || 'Guest',
        items: req.body.items || [],
        total: req.body.total || 0,
        status: 'Pending',
        time: new Date().toLocaleTimeString()
    };

    studentOrders.push(newOrder); // 🔥 Memory-la store panrom
    console.log("✅ NEW ORDER RECEIVED! ID:", newOrder.id);
    res.json({ success: true, order: newOrder });
});

// B. SENDER: Admin page keka-rappo data-va anuppa:
// 🔥 IDHU ILLAI NA DHAAN WEBSITE LA VALUES VARAADHU
app.get('/api/orders', (req, res) => {
    // Return the full array of orders
    res.json(studentOrders);
});

//////history find panna code
app.get('/api/orders/history', (req, res) => {
    console.log("✅ History sending to website...");
    res.json(orderHistory); // Memory-la irukkura list-a anuppurom
});

// server.js kulla idhu irukunu check pannunga
app.post('/api/auth/login-track', (req, res) => {
    const studentID = req.body.id;

    // 🔥 THIS PRINT COMMAND SHOWS IN TERMINAL
    console.log("--------------------------------------");
    console.log("✅ STUDENT LOGGED IN! ID:", studentID);
    console.log("Time:", new Date().toLocaleTimeString());
    console.log("--------------------------------------");

    res.json({ success: true });
});

app.post('/api/orders', (req, res) => {
    try {
        const newOrder = req.body;

        // 1. Storage-la poodurom
        orderHistory.push(newOrder);

        console.log("✅ ORDER PLACED SUCCESSFULLY! ID:", newOrder.id);

        // 2. 🔥 ROMBA MUKKIYAM: Website-ku success message anuppurom
        res.status(201).json({ success: true, message: "Order Received" });

    } catch (error) {
        console.log("❌ Order Error:", error);
        res.status(500).json({ success: false });
    }
});





app.get('/api/revenue/today', (req, res) => {

    const today = new Date().toISOString().split('T')[0];

    const todayOrders = orders.filter(order => order.date === today);

    const revenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    res.json({ revenue });
});


app.listen(5000, () => console.log('Backend running on http://localhost:5000'));