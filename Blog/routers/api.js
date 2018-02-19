
const express = require('express');
const router = express.Router();
const User = require('../models/Users')
const Content = require('../models/Content')

// const p = process.on('warning', (warning) => console.warn('Do not do that!'));

//统一返回格式
var responseData;
router.use(function(req,res,next){
    responseData={
        code:0,
        message:''
    }
    next();
})


router.post('/user/register',(req, res,next)=>{
    // res.send('main-User');
    let username = req.body.username;
    let password = req.body.password;
    let repassword = req.body.repassword;
    //用户是否为空
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);//返回给前端
        return;
    }
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);//返回给前端
        return;
    }
    if(password !== repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);//返回给前端
        return;
    }
    //用户名是否已经被注册了，如果数据库中已经存在和我们要注册的用户同名的数据，表示该用户已经注册
     // 查询数据库是否该用户已存在
    User.findOne({
        username:username
    }).then(function(userInfo){
        // console.log(userInfo)
        if(userInfo){
            //表示数据库中有该记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册了';
            res.json(responseData);
            return;
        }
        //保存用户注册的信息到数据库中
        var user = new User({
            username:username,
            password:password,
        });
        return user.save();
    }).then(function(newUserInfo){
        // console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json(responseData);
    })
});

// 登录
router.post('/user/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    if( username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }
    //查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
    User.findOne({
        username,
        password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }else{//用户名密码正确
            responseData.message = '登录成功';
            responseData.userInfo ={
                _id:userInfo._id,
                username:userInfo.username
            }
            req.cookies.set('userInfo',JSON.stringify({//保存cookie
                _id: userInfo._id,
                username:userInfo.username
            }));
            res.json(responseData);
            return;
        }
    })
})

//退出登录
router.get('/user/logout',function(req,res){
    req.cookies.set('userInfo',null);
    responseData.message = '退出';
    res.json(responseData);
})

/**
 * 获取指定文章的所有评论
 */
router.get('/comment',function(req,res){
    var contentId = req.query.contentid || '';
    // console.log(contentId);
     //查询当前内容的信息
    Content.findOne({
        _id:contentId
    }).then(function(content){
        responseData.data = content.comments;
        res.json(responseData)
    },(error)=>{
        // console.log(error);
    })
})


/**
 * 评论提交
 */

 router.post('/comment/post',function(req,res){
     //内容的Id
     var contentId = req.body.contentid || '';
     var postData = {//创建一个评论的对象，用来装评论相关的内容
         username: req.userInfo.username,//评论人
         postTime:new Date(),//评论时间
         content:req.body.content//评论的内容
     };

     //查询当前内容的信息
     Content.findOne({
         _id:contentId
     }).then(function(content){
         content.comments.push(postData);
         return content.save(); 
     }).then(function(newContent){
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
     })
 })

module.exports = router;