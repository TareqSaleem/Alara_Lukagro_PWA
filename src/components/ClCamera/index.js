import React, { Component } from 'react';
import { Webcam } from '../../webcam';
import './ClCamera.css';
import axios from 'axios';

class ClCamera extends Component {
    constructor() {
        super();
        this.webcam = null;
        this.state = {
            capturedImage: null,
            captured: false,
            uploading: false,
            descriptionValue: ''
        }
        this.handleDescriptionChange= this.handleDescriptionChange.bind(this);
        this.hasBeenCalled = false
    }
    handleDescriptionChange(event) {
        this.setState({descriptionValue: event.target.value});
    }

    sendEmail= (e) => {
        e.preventDefault();
        this.state.uploading = true
        
        var body = {
            description: this.state.descriptionValue
          }
          if (this.state.captured)
          {
            body["image"] = this.state.capturedImage
 
          }
        if (!this.hasBeenCalled){
            axios.post('https://us-central1-alara-mail-server.cloudfunctions.net/api1/sendEmail', body)
            .then(function (response) {
                this.state.uploading = false
                this.hasBeenCalled = true
            })
            .catch(function (error) {
                this.state.uploading = false
                this.hasBeenCalled = true
            console.log(error);
          });
        }
        
    }

    componentDidMount() {
        // initialize the camera
        this.canvasElement = document.createElement('canvas');
        this.webcam = new Webcam(
            document.getElementById('webcam'),
            this.canvasElement
        );
        this.webcam.setup().catch(() => {
            alert('Fout bij het verkrijgen van toegang tot uw camera');
        });
    }

    componentDidUpdate(prevProps) {
        if (!this.props.offline && (prevProps.offline === true)) {
            // if its online,
            this.batchUploads();
        }
    }
    

    render() {

        const imageDisplay = this.state.capturedImage ?
            <img src={this.state.capturedImage} alt="captured" width="100%" height="100%" />
            :
            <span />;


        const buttons = this.state.captured ?
        
            <div class="text-center">
                <button className="deleteButton" onClick={this.discardImage} > Foto Verwijderen </button>
                <button className="captureButton" onClick={this.sendEmail.bind(this)}> Verzenden </button>
            </div> :
            <div>
            <form className="contact-form" method="POST" action="/index" onSubmit={this.sendEmail.bind(this)}>
            <button className="captureButton" onClick={this.captureImage} > Foto Maken </button>
            <button className="captureButton" type="submit">Verzenden</button>
            </form>
            </div>
            
        const uploading = this.state.uploading ?
            <div><p> Post uploaden, even geduld... </p></div>
            :
            <span />

        return (
            <div>
                
                {uploading}
                <video autoPlay playsInline muted id="webcam" width="100%" height="100%" />
                <br />
                <div className="imageCanvas">
                    {imageDisplay}
                </div>

                <form className="contact-form" method="POST" action="/index">
                    <textarea class="form-control" type="textarea" id="beschrijving" 
                    value={this.state.descriptionValue} onChange={this.handleDescriptionChange} 
                    name="beschrijving" placeholder="Beschrijving" maxlength="140" rows="5" required></textarea>
                </form>
                {buttons}
            </div>
        );
    }


    captureImage = async () => {
        const capturedData = this.webcam.takeBase64Photo({ type: 'jpeg', quality: 1.0 });
        this.setState({
            captured: true,
            capturedImage: capturedData.base64
        });
    }

    discardImage = () => {
        this.setState({
            captured: false,
            capturedImage: null
        })
    }

}
export default ClCamera;