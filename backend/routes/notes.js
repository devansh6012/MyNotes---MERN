const express = require('express');
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');


// Fetch all notes
// GET /api/notes/fetchallnotes
// Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        
        const notes = await Note.find({user: req.user.id});
        res.json(notes)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occured");
    }
})


// Create note
// POST /api/notes/addnote
// Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 1 }),
    body('description', 'Enter a valid description').isLength({ min: 3 }),
], async (req, res) => {

    try {
        
        const {title, description, tag} = req.body;
        
        // if error return bad request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occured");
    }

})


// Update Note
// PUT /api/notes/updatenote
// Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    try {
        
        const {title, description, tag} = req.body;
        
        // Create a new note object
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};
    
        
        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not found")}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed"); 
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json(note)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occured");
    }

})


// Delete Note
// DELETE /api/notes/deletenote
// Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        
        // Find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not found")}

        // Allow deletion only if user owns this note
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed"); 
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Success":"Not has been deleted",note:note})

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occured");
    }

})

module.exports = router