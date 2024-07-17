import React from 'react';
import { FacebookProvider, LoginButton } from 'react-facebook';
import "./facebookButton.css"

const FacebookLoginButton = ({ onLogin }) => {
    const handleResponse = (data) => {
        console.log(data);
        if (data.authResponse && data.authResponse.accessToken) {
            onLogin(data.authResponse.accessToken);
        }
    };

    return (
        <FacebookProvider appId="498205042625757">
            <div className="page">

                <img src="/facebook.png" alt="" />
                <LoginButton
                    scope="public_profile,email,pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_metadata"
                    onSuccess={handleResponse}
                    onError={(error) => console.error(error)}
                    className="facebook-button"
                >
                    Login with Facebook
                </LoginButton>
            </div>
        </FacebookProvider>
    );
};

export default FacebookLoginButton;