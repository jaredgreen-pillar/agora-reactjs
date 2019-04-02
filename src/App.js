import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import AgoraRTC from 'agora-rtc-sdk'

var client, localStream, camera, microphone, audioSelect, videoSelect;

class App extends Component {

  render() {
    return (
      <div className="App">

        <div id="div_device" class="panel panel-default">
          <div class="select">
            <label for="audioSource">Audio source: </label><select id="audioSource"></select>
          </div>
          <div class="select">
            <label for="videoSource">Video source: </label><select id="videoSource"></select>
          </div>
        </div>

        <div id="div_join" class="panel panel-default">
          <div class="panel-body">
            App ID: <input id="appId" type="text" value="68829a00412b4cec98d77efbc47f9ca7" size="36"></input>
            Channel: <input id="channel" type="text" value="demoChannel1" size="4"></input>
            Host: <input id="video" type="checkbox" checked></input>
            <button id="join" class="btn btn-primary" onClick={this.join}>Join</button>
            <button id="leave" class="btn btn-primary" onClick={this.leave}>Leave</button>
          </div>
        </div>

        <div id="videoSpot" >
          <div id="agora_local" ></div>
        </div>
      </div>


    );
  }

  componentDidMount() {
    audioSelect = document.querySelector('select#audioSource');
    videoSelect = document.querySelector('select#videoSource');
    this.getDevices();
  }

  getDevices() {
    AgoraRTC.getDevices(function (devices) {
      for (var i = 0; i !== devices.length; ++i) {
        var device = devices[i];
        var option = document.createElement('option');
        option.value = device.deviceId;
        if (device.kind === 'audioinput') {
          option.text = device.label || 'microphone ' + (audioSelect.length + 1);
          audioSelect.appendChild(option);
        } else if (device.kind === 'videoinput') {
          option.text = device.label || 'camera ' + (videoSelect.length + 1);
          videoSelect.appendChild(option);
        } else {
          console.log('Some other kind of source/device: ', device);
        }
      }
    });
  }

  join() {
    console.log('suhh - joined channel')
    document.getElementById("join").disabled = true;
    document.getElementById("video").disabled = true;
    var channel_key = null;
    const appId = {
      value: "68829a00412b4cec98d77efbc47f9ca7"
    };
    const channel = {
      value: "demoChannel1"
    }
    console.log("Init AgoraRTC client with App ID: " + appId.value);
    client = AgoraRTC.createClient({ mode: 'live' });
    client.init(appId.value, function () {
      console.log("AgoraRTC client initialized");
      client.join(channel_key, channel.value, null, function (uid) {
        console.log("User " + uid + " join channel successfully");

        if (document.getElementById("video").checked) {
          camera = videoSelect.value;
          microphone = audioSelect.value;
          localStream = AgoraRTC.createStream({ streamID: uid, audio: true, cameraId: camera, microphoneId: microphone, video: document.getElementById("video").checked, screen: false });
          //localStream = AgoraRTC.createStream({streamID: uid, audio: false, cameraId: camera, microphoneId: microphone, video: false, screen: true, extensionId: 'minllpmhdgpndnkomcoccfekfegnlikg'});
          if (document.getElementById("video").checked) {
            localStream.setVideoProfile('720p_3');

          }

          // The user has granted access to the camera and mic.
          localStream.on("accessAllowed", function () {
            console.log("accessAllowed");
          });

          // The user has denied access to the camera and mic.
          localStream.on("accessDenied", function () {
            console.log("accessDenied");
          });

          localStream.init(function () {
            console.log("getUserMedia successfully");
            localStream.play('agora_local');

            client.publish(localStream, function (err) {
              console.log("Publish local stream error: " + err);
            });

            client.on('stream-published', function (evt) {
              console.log("Publish local stream successfully");
            });
          }, function (err) {
            console.log("getUserMedia failed", err);
          });
        }
      }, function (err) {
        console.log("Join channel failed", err);
      });
    }, function (err) {
      console.log("AgoraRTC client init failed", err);
    });

    var channelKey = "";
    client.on('error', function (err) {
      console.log("Got error msg:", err.reason);
      if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
        client.renewChannelKey(channelKey, function () {
          console.log("Renew channel key successfully");
        }, function (err) {
          console.log("Renew channel key failed: ", err);
        });
      }
    });


    client.on('stream-added', function (evt) {
      var stream = evt.stream;
      console.log("New stream added: " + stream.getId());
      console.log("Subscribe ", stream);
      client.subscribe(stream, function (err) {
        console.log("Subscribe stream failed", err);
      });
    });

    client.on('stream-subscribed', function (evt) {
      console.log('stream-subscribed')
      var stream = evt.stream;
      console.log("Subscribe remote stream successfully: " + stream.getId());
      if (document.getElementById("videoSpot #agora_remote" + stream.getId()) === null) {
        var el = document.getElementById("videoSpot");
        console.log("🤙" + el.outerHTML)
        var innerDiv = document.createElement('div');
        innerDiv.id = `agora_remote${stream.getId()}`
        innerDiv.style = "float:left; width:810px;height:607px;display:inline-block;"

        el.appendChild(innerDiv);
      }
      stream.play('agora_remote' + stream.getId());
    });

    client.on('stream-removed', function (evt) {
      var stream = evt.stream;
      stream.stop();
      // $('#agora_remote' + stream.getId()).remove();
      console.log("Remote stream is removed ${}" + stream.getId());
    });

    client.on('peer-leave', function (evt) {
      var stream = evt.stream;
      if (stream) {
        stream.stop();
        // $('#agora_remote' + stream.getId()).remove();
        console.log(evt.uid + " leaved from this channel");
      }
    });
  }

  leave() {
    document.getElementById("leave").disabled = true;
    client.leave(function () {
      console.log("Leavel channel successfully");
    }, function (err) {
      console.log("Leave channel failed");
    });
  }

}

export default App;
