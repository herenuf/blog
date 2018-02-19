var prepage=5;//一页显示几条评论内容
var page = 1;
var pages = 0;
var comments=[];

//提交评论
$('#messageBtn').on('click',function(){
    // console.log(comments.length)
    $.ajax({
        type:'POST',
        url:'/api/comment/post',
        data:{
            contentid: $("#contentId").val(),
            content:$("#messageContent").val()
        },
        success:function(responseData){
            // console.log(responseData)
            $("#messageContent").val('');
            comments = responseData.data.comments.reverse();
            // console.log(comments);
            renderComment();
        }
    })
    
})

//每次页面重载的时候获取一下该文章的所有评论
$.ajax({
    url:'/api/comment',
    data:{
        contentid: $("#contentId").val(),
    },
    success:function(responseData){
        // console.log(responseData)
        comments = responseData.data.reverse()
        // console.log(comments);
        renderComment();
    }
})

$('.pager').delegate('a','click',function(){
    // alert(1)
    if($(this).parents().hasClass('previous')){
        // alert('上一页');
        page--;
    }else{
        // alert('下一页');
        page++;
    }
    renderComment()
})

function renderComment(){
    $('#messageCount').html(comments.length);
    pages =Math.max(Math.ceil(comments.length/prepage),1);
    var start = Math.max(0,(page-1)*prepage);
    var end= Math.min(prepage+start,comments.length);
    var $lis = $('.pager li');
    $lis.eq(1).html(page+'/'+ pages);

    if(page<=1){
        page = 1;
        $lis.eq(0).html('<span>没有了上一页</span>');
    }else{
        $lis.eq(0).html('<a href="javascript:">上一页</a>');
    }

    if(comments.length == 0){
        $('.messageList').html('<div class="messageBox"><p class="leave">还没有评论</p></div>');
    }else{
        var str = '';
        for(var i=start;i<end;i++){
            str +=`
            <div class="messageBox">
                <p class="name"><span class="fl">${comments[i].username}</span><span class="fr">${foratDatee(comments[i].postTime)}</span></p>
                <p>${comments[i].content}</p>
            </div>`;
            
        }
        // console.log(str);
        $('.messageList').html(str);
    }

    if(page>=pages){
        page=pages;
        $lis.eq(2).html('<span>没有了下一页</span>');
    }else{
        $lis.eq(2).html('<a href="javascript:">下一页</a>');
    }

   
}

//时间
function foratDatee(d){
    // console.log(d);
    var date = new Date(d);
    return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日'+date.getHours()+':'
    +date.getMinutes()+':'+date.getSeconds();
    // return date.getFullYear().year + "年" + date.month + "月" + this.date + "日 " + this.hour + ":" + this.minute + ":" + this.second + " " + this.day
}

