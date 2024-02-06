const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogDB');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log('Connected to MongoDB database.');
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

//Define schema for blog posts
const blogSchema = new mongoose.Schema({
    title: String,
    body: String,
    author: String,
    timestamps: {
        type:  Date,
        default: Date.now
    }
});

const Blog = mongoose.model('Blog', blogSchema);

//API endpoints
app.post('/blogs', async(req, res) => {
    try{
        const {title, body, author} = req.body;
        if(!title || !body) {
            return res.status(400).json({ error: "Title and body are required."});
        }
        const blog = new Blog({ title, body, author});
        await blog.save();
        res.status(201).json(blog);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
});

app.get('/blogs', async (req, res) => {
    try{
        const blogs = await Blog.find();
        res.json(blogs);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
});

app.get('/blogs/:id', async(req, res) => {
    try{
        const blog = await Blog.findById(req.params.id);
        if(!blog) {
            return res.status(404).json({ error: "Blog not find."});
        }
        res.json(blog);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
});

app.put('/blogs/:id', async (req, res) => {
    try{
        const { title, body, author} = req.body;
        const blog = await Blog.findByIdAndUpdate(req.params.id, { title, body, author }, {new: true});
        if(!blog) {
            return res.status(404).json({error: "Blog not found."});
        }
        res.json(blog);
    } catch(error) {
        res.status(500).json({ error: error.message});
}
});

app.delete('/blogs/:id', async (req, res) => {
    try{
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if(!blog) {
            return res.status(404).json({ error: "Blog not found."});
        }
        res.json({ message: "Blog deleted successfully."});
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
});

//Start the server
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = Blog;