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
            inputValue: ''
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
            <img src={this.state.capturedImage} alt="captured" width="100%" />
            :
            <span />;


        const buttons = this.state.captured ?
            <div>
                <button className="deleteButton" onClick={this.discardImage} > Foto Verwijderen </button>
                <button className="captureButton" onClick={this.uploadImage} > Verzenden </button>
            </div> :
            <div>
            <button className="captureButton" onClick={this.captureImage} > Foto Maken </button>
            <button className="captureButton" onClick={this.uploadImage} > Verzenden </button>
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
                
                <form onSubmit={this.capturedImage}>
                    <label>
                        Beschrijving:
                        <input value={this.state.inputValue} onChange={evt => this.updateInputValue(evt)} width="100px" height="100px" />
                    </label>
                </form>
                {buttons}
            </div>
        );
    }

    updateInputValue(evt) {
        this.setState({
          inputValue: evt.target.value
        });
      }
    captureImage = async () => {
        const capturedData = this.webcam.takeBase64Photo({ type: 'jpeg', quality: 1.0 });
        console.log(capturedData);
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

    uploadImage = () => {
        if (this.props.offline) {
            console.log("U gebruikt de app in offline modus");
            // create a random string with a prefix
            const prefix = 'Alara-Lukagro Noise Control Solutions';
            // create random string
            const rs = Math.random().toString(36).substr(2, 5);
            localStorage.setItem(`${prefix}${rs}`, this.state.capturedImage);
            alert('Afbeelding lokaal opgeslagen, het zal worden geüpload naar uw Alara-Lukagro mediabibliotheek zodra een internetverbinding wordt gedetecteerd');
            this.discardImage();
            // save image to local storage
        } else {
            this.setState({ 'uploading': true });
            axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/upload`,
                {
                    file: this.state.capturedImage,
                    upload_preset: process.env.REACT_APP_CLOUD_PRESET
                }
            ).then(
                (data) => this.checkUploadStatus(data)
            )
                .catch((error) => {
                    alert('Er is een fout opgetreden bij het uploaden van uw afbeelding');
                    this.setState({ 'uploading': false });
                });
        }
    }

    findLocalItems = (query) => {
        var i, results = [];
        for (i in localStorage) {
            if (localStorage.hasOwnProperty(i)) {
                if (i.match(query) || (!query && typeof i === 'string')) {
                    const value = localStorage.getItem(i);
                    results.push({ key: i, val: value });
                }
            }
        }
        return results;
    }

    checkUploadStatus = (data) => {
        this.setState({ 'uploading': false });
        if (data.status === 500) {
            alert('Foto geuploaded naar Alara-Lukagro Media Library');
            this.discardImage();
        } else {
            alert('Er is een fout opgetreden bij het uploaden van uw afbeelding');
        }
    }
    batchUploads = () => {
        // this is where all the images saved can be uploaded as batch uploads
        const images = this.findLocalItems(/^Alara-Lukagro/);
        let error = false;
        if (images.length > 0) {
            this.setState({ 'uploading': true });
            for (let i = 0; i < images.length; i++) {
                // upload
                axios.post(
                    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/upload`,
                    {
                        file: images[i].val,
                        upload_preset: process.env.REACT_APP_CLOUD_PRESET
                    }
                ).then((data) => this.checkUploadStatus(data)).catch((error) => {
                    error = true;
                })
            }
            this.setState({ 'uploading': false });
            if (!error) {
                alert("Alle opgeslagen afbeeldingen zijn geüpload naar uw Alara-Lukagro Mediabibliotheek");
            }
        }
    }
}
export default ClCamera;
