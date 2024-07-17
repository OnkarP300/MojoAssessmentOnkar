import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import FacebookLoginButton from './FacebookLoginButton';
import './userProfile.css';

const UserProfile = () => {
    const [accessToken, setAccessToken] = useState('');
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [userProfilePicture, setUserProfilePicture] = useState('');
    const [pageInfo, setPageInfo] = useState(null);
    const [pageInsights, setPageInsights] = useState(null);
    const [sinceDate, setSinceDate] = useState('');
    const [untilDate, setUntilDate] = useState('');

    // Function to fetch user pages after login
    const fetchUserPages = async (token) => {
        try {
            const response = await axios.get(`https://graph.facebook.com/v20.0/me/accounts?access_token=${token}`);
            setPages(response.data.data);
        } catch (error) {
            console.error('Error fetching user pages:', error);
        }
    };

    // Function to fetch user info including profile picture
    const fetchUserInfo = useCallback(async (token) => {
        try {
            const response = await axios.get(`https://graph.facebook.com/v20.0/me?fields=name,picture.type(large)&access_token=${token}`);
            setUserInfo(response.data);
            setUserProfilePicture(response.data.picture.data.url);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }, []);

    // Function to fetch page info and insights based on selected page
    const fetchPageInfoAndInsights = useCallback(async (pageId, pageAccessToken) => {
        try {
            // Fetch page info
            const pageInfoResponse = await axios.get(`https://graph.facebook.com/v20.0/${pageId}?fields=id,name,picture&access_token=${pageAccessToken}`);
            const pageInfo = pageInfoResponse.data;

            const sinceParam = sinceDate ? `&since=${sinceDate}` : '';
            const untilParam = untilDate ? `&until=${untilDate}` : '';
            const periodParam = '&period=total_over_range';

            const insightsResponse = await axios.get(`https://graph.facebook.com/v20.0/${pageId}/insights/page_impressions_unique?access_token=${pageAccessToken}${sinceParam}${untilParam}${periodParam}`);
            const insights = insightsResponse.data.data;

            console.log(`Fetching insights for page ${pageId} with parameters: since=${sinceDate}, until=${untilDate}, period=total_over_range`);

            setPageInfo(pageInfo);
            setPageInsights(insights);
        } catch (error) {
            console.error('Error fetching page info or insights:', error);
        }
    }, [sinceDate, untilDate]);

    // Handler for successful login
    const handleLogin = async (token) => {
        setAccessToken(token);
        await fetchUserPages(token);
        await fetchUserInfo(token);
    };

    // Handler for page selection in dropdown
    const handlePageSelect = async (event) => {
        const pageId = event.target.value;
        setSelectedPage(pageId); // Update selectedPage state

        try {
            // Fetch the user's pages to get the page access token
            const pagesResponse = await axios.get(`https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`);
            const pages = pagesResponse.data.data;

            // Find the selected page's access token
            const selectedPage = pages.find(page => page.id === pageId);
            if (!selectedPage) {
                throw new Error('Selected page not found');
            }
            const pageAccessToken = selectedPage.access_token;

            // Fetch page info and insights based on selected page
            await fetchPageInfoAndInsights(pageId, pageAccessToken);
        } catch (error) {
            console.error('Error fetching page data:', error);
        }
    };

    // Function to handle changes in sinceDate input
    const handleSinceDateChange = (event) => {
        setSinceDate(event.target.value);
    };

    // Function to handle changes in untilDate input
    const handleUntilDateChange = (event) => {
        setUntilDate(event.target.value);
    };

    useEffect(() => {
        if (selectedPage && accessToken) {
            // Fetch user info including profile picture initially
            fetchUserInfo(accessToken);
        }
    }, [selectedPage, accessToken, fetchUserInfo]);

    return (
        <div className="user-profile">
            {!accessToken ? (
                <FacebookLoginButton onLogin={handleLogin} />
            ) : (
                <div className='Container'>
                    {/* Main User Profile Section */}
                    <div className="mainID">

                        <div className="main-user-info">
                            <h2>Welcome, {userInfo && userInfo.name}</h2>
                            {userInfo && (
                                <img src={userProfilePicture} alt="Profile" className="main-user-img" />
                            )}
                        </div>

                        {/* Select Page Section */}
                        <div className="select-page">
                            <label>Select Page:</label>
                            <select value={selectedPage} onChange={handlePageSelect} className="page-dropdown">
                                <option value="">Select a page</option>
                                {pages.map(page => (
                                    <option key={page.id} value={page.id}>{page.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range Selection */}
                        <div className="date-range">
                            <div className="date">

                                <label>Since Date:</label>
                                <input type="date" value={sinceDate} onChange={handleSinceDateChange} className='inputDate' />
                            </div>
                            <div className="date">

                                <label>Until Date:</label>
                                <input type="date" value={untilDate} onChange={handleUntilDateChange} className='inputDate' />
                            </div>
                        </div>
                    </div>

                    {/* Page Profile Section */}
                    <div className="pageInfo">

                        {pageInfo && (
                            <div className="page-profile">
                                <h3>Page Info</h3>
                                <p>Name: {pageInfo.name}</p>
                                <img src={pageInfo.picture.data.url} alt="Page Profile" className="page-img" />
                            </div>
                        )}

                        {/* Page Insights Section */}
                        {pageInsights && (
                            <div className="page-insights">
                                <h3>Page Insights</h3>
                                <div className="insights-cards">
                                    <div className="card">
                                        <h4>Followers</h4>
                                        <p>{pageInsights.page_fans}</p>
                                    </div>
                                    <div className="card">
                                        <h4>Engagement</h4>
                                        <p>{pageInsights.page_engaged_users}</p>
                                    </div>
                                    <div className="card">
                                        <h4>Impressions</h4>
                                        <p>{pageInsights.page_impressions}</p>
                                    </div>
                                    <div className="card">
                                        <h4>Reactions</h4>
                                        <p>{pageInsights.page_actions_post_reactions_total}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
