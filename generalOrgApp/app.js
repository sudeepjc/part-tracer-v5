const express = require("express");
const Joi = require('joi');
const enrollUser = require('./app/enrollUser');

const app = express();
app.use(express.json());

app.post('/api/:org/enroll/:user',(req,res)=>{

    const schema = Joi.object({
        userPwd: Joi.string().min(3).required(),
    });
    
    const result = schema.validate(req.body);
    
    console.log(result);
    
    if (result.error) {
        return res.status(400).send(result.error);
    }

    if(org != 'general'){
        return res.status(400).send("This request was meant for general organization");
    }

    if(!user && user.length >3 ){
        return res.status(400).send("Input validation error w.r.t user");
    }

    return enrollUser(req.params.user,req.body.userPwd,req.params.org);
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}....`));