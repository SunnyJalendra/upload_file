import app from "./src/app.js";


const PORT = process.env.PORT || 5000;
console.log(process.env.MONGODB_URL)
app.listen(PORT, () => {
    console.log(`the backend is running on the port ${PORT}`);
})