import os

from flask import Flask, session, render_template 
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = ["Flack Home"]
messages = {"Flack Home":["Flack: Welcome to flack. Use this application to chat with other users through selected channels ^_^."]}


@app.route("/")
def index():
    return render_template("index.html", channels = channels)

@socketio.on("addChannel")
def addChannel(channel):
    channelName = channel["channelName"]
    if channelName != None:
        channels.append(channelName)
        messages[channelName] = []
        emit("announceChannel", {"channelName": channelName}, broadcast=True)
    else:
        emit("nullChannel")
        
@socketio.on("getMessages")
def sendMessages(channel):
    channelName = channel["channelName"]    
    channelMessages = messages[channelName]
    #print(channelName, channelMessages)
    for i in range(len(channelMessages)):
        emit("showMessages", {"message": channelMessages[i], "channel":channelName}, broadcast = False)


@socketio.on("sendMessage")
def sendMessage(data):
    channelName = data["channelName"]
    messageText = data["messageText"]
    user = data["user"]
    message = f"{user} : {messageText}"
    channelMessages = messages[channelName]
    if len(channelMessages)==100:
        channelMessages.pop(0)
    channelMessages.append(message)
    emit("showMessages", {"message":message, "channel":channelName}, broadcast = True)

@socketio.on("deleteMessage")
def deleteMessage(data):
    channelName = data["channelName"]
    message = data["messageText"]
    channelMessages = messages[channelName]
    index = data["index"]
    channelMessages.pop(index)
    messages[channelName] = channelMessages
    #now delete it on the webpage
    emit("deleteMessage", {"index":index, "channel":channelName}, broadcast = True)

if __name__ == "__main__":
    socketio.run(app)