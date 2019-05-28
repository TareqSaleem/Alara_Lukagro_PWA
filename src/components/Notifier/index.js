import React, { Component } from "react";
import "./Notifier.css";
import classnames from 'classnames';

class Notifier extends Component {
    render() {
        const notifyclass = classnames('notify', {
            danger: this.props.offline
        });
        const message = this.props.offline ?
            `
            Alara-Lukagro app is offline! Uw afbeeldingen worden nu lokaal opgeslagen zodra uw 
            internetverbinding weer beschikbaar is worden dan uw foto's naar Alara-Lukagro Mediabibliotheek geüpload.
        ` :
            `
            Maak een foto en deze zal worden geüpload naar Alara-Lukagro Mediabibliotheek.
        `;
        return (
            <div className={notifyclass}>
                <p>
                    <em>{message}</em>
                </p>
            </div>
        );
    }
}

export default Notifier;
