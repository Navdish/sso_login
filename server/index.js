const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Users = require('./Schema')


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://navdishjaggi:navdishjaggi@cluster0.ibgcnsc.mongodb.net/")
    .then(console.log("DB connected"))
    .catch((error) => console.log(error));

function authenticateUser(req, res, next) {
    const token = req.headers['TGC'];
    
    console.log(token);
    if(token == null) return res.status(401);

    jwt.verify(token, 'Zenmonk', (err, user)=> {
        if(err) return res.status(403).json({message : 'No longer valid'});
        req.user = user;
        next();
    })
}

app.post("/", authenticateUser , function (req, res){
    res.status(200).json({"meassage": "existing user"});
})

app.post('/signup',async function(req, res){
    const {name, email, password} = req.body;
    // console.log(req.body);
    const user = await Users.findOne({email}).exec();

    if(user)
    {
        return res.status(400).json({message :'something went wrong'});
    }
    else 
    {
        const hash = await bcrypt.hash(password, saltRounds);
        // console.log(hash);
        const new_user = await Users.create({name, email, password : hash});
        res.status(200).json({message : "ok"});
    }

})

app.post('/login',async function(req, res){
        const {email, password} = req.body;
        const user = await Users.findOne({email: email}).exec();
        console.log(user);
        if(user )
        {
            if( bcrypt.compare(user.password, password)){
                const token = jwt.sign({id : user._id, email : user.email}, 'Zenmonk', {
                    expiresIn: '4h'
                })
                return res.status(200).json(token);
            }
            
        }
        return res.status(403).json({message :'No user found with such credentials'});
    
    })


app.listen(8080, function() {
    console.log("Server is running on 8080");
  });