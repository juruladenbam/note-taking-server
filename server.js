const { log } = require('console');
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(express.json());

const filePath = 'notes.json'

const readNotes = () => {
    try {
        const notesBuffer = fs.readFileSync(filePath, 'utf-8');
        const notesString = notesBuffer.toString();
        return JSON.parse(notesString);
    } catch (error) {
        return {users:{}};
    }
}

const writeNotes = (notes) => {
    const notesString = JSON.stringify(notes);
    fs.writeFileSync(filePath,notesString);
}

function newUser() {
    const userUUID = uuidv4();

    const data = readNotes();
    
    data.users[userUUID] = { notes: [] };
    writeNotes(data);
    return userUUID;
}

app.get('/', (req,res) => {
    res.send('welcome');
});

app.get('/api/user', (req,res) => {
    const user = newUser();    
    res.json(user);
});

app.get('/api/notes/:uuid', (req,res) => {
    const uuid = req.params.uuid;
    
    const notes = readNotes();
    const data = notes.users[uuid].notes;
    
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    const uuid = req.body.uuid;
    const notes = readNotes();
    const newNote = {
        id: Date.now(),
        content: req.body.content
    }
    let data = notes.users[uuid].notes;
    data.push(newNote);
    writeNotes(notes);
    res.json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const id = parseInt(req.params.id);
    const index = notes.findIndex((t) => t.id === id);
    if(index !== -1){
        notes[index].completed = req.body.completed;
        writeNotes(notes);
        res.json(notes[index]);
    }else{
        res.status(404).send('Note not found');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});