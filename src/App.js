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
}

export default App;
