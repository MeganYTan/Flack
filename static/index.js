function nodeIndex(el) {
    var i=0;
    while(el.previousElementSibling ) {
        el=el.previousElementSibling;
        i++;
    }
    return i;
}
document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    //get display name
    while(!localStorage.getItem('displayName') || localStorage.getItem('displayName')== ""){
        localStorage.setItem('displayName', prompt("Please choose a display name:", ""));
    }
    //get channel 
    if (!localStorage.getItem('currentChannel')){
        localStorage.setItem('currentChannel',"Flack Home");
    }
    //display the display name
    document.querySelector('#displayName').innerHTML = localStorage.getItem('displayName');
    
    //add channel button -- on click, prompt for name of channel, then send it to the server for it to be added
    socket.on('connect', () => {
        document.querySelector('#addChannelButton').onclick = () =>{
            const channelName = prompt("Please choose a channel name:","");
            socket.emit('addChannel',{'channelName':channelName});
        };
    });
    //add channel part 2 -- announcing it to the users
    socket.on('announceChannel', data => {
          const li = document.createElement('li');
        //<li class="list-group-item list-group-item-action bg-dark text-light"><a href="#" >{{ channel }}</a></li>
            li.classList.add('list-group-item','list-group-item-action','bg-dark','text-light')
          li.innerHTML = `<a href = "" class = 'channel' data-channel = "${data.channelName}">${data.channelName}</a>`;
          document.querySelector('#channels').append(li);
    });
    //load messages when website just launch
    socket.on('connect',()=>{
       let channelName = localStorage.getItem('currentChannel');
        socket.emit('getMessages', {'channelName':channelName});
    });
    //load messages when a channel is selected
    document.querySelectorAll('.channel').forEach(link => {
        link.onclick = () => { 
            localStorage.setItem('currentChannel',link.dataset.channel);
            socket.emit('getMessages', {'channelName':link.dataset.channel});
        };
    });
    //show messages (show all when connected or when channel selected); show message that is sent
    socket.on('showMessages', data =>{
        if(localStorage.getItem('currentChannel') == data.channel){
            const li = document.createElement('li');
            li.innerHTML = data.message;
            li.classList.add('bg-light','list-group-item','message');
            
            //add delete button if current user is message user
            let messageUser = data.message.substr(0,data.message.indexOf(':')-1);
            let currentUser = localStorage.getItem('displayName');
            if(messageUser.valueOf()==currentUser.valueOf()){
                const but = document.createElement('button');
                but.innerHTML = ('X');
                but.classList.add('btn', 'btn-danger');
                li.append(but);
                but.onclick = function(){//delete the message
                    
                    socket.emit('deleteMessage',{'messageText':data.message, 'channelName':localStorage.getItem('currentChannel'), 'index':nodeIndex(li)});
                }
            }
            document.querySelector('#messages').append(li); 
            var objDiv = document.getElementById("chatBody");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
        
    });
    
    //add message (when send button is clicked) 
    socket.on('connect', () => {
        document.querySelector('#sendMessageButton').onclick = () =>{
            let messageText = document.querySelector('#messageText').value;
            socket.emit('sendMessage',{'messageText':messageText,'user':localStorage.getItem('displayName'), 'channelName':localStorage.getItem('currentChannel')});
        };
    });
    
    socket.on('deleteMessage', data =>{
        if(localStorage.getItem('currentChannel').valueOf()==data.channel.valueOf()){
            console.log("IN THE CHANNEL");
            let index = data.index;
            var messages = document.querySelectorAll(".message");
            messages[index].remove();
            /**
            var messages = document.querySelectorAll(".message");
            var messageToDelete = data.message;
            console.log(messageToDelete.valueOf());
            
            for(var i =0;i<messages.length;i++){
                let message = messages[i].textContent; 
                let lastChar = message.charAt(message.length-1);
                if (lastChar == 'X'){
                    message = message.substr(0,message.length-1);
                }
                if(messageToDelete.valueOf() == message.valueOf()){
                    console.log("DELETE MESSAGE");
                    //if found the message... delete it
                    messages[i].remove();
                }
            }**/
            
        }
        /*
        var messages = document.querySelectorAll(".message");
        console.log(messages);
        var messageToDelete = data.message;
        var found;

        for (var i = 0; i < aTags.length; i++) {
          if (aTags[i].textContent == searchText) {
            found = aTags[i];
            break;
          }
        }*/
    });
    
   
});

