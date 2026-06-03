// src/pages/Opportunities.jsx
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { baseUrl } from '../pages/data/api';
import './Opportunities.css';
import { useAuth } from '../contexts/AuthContext';
import {useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';

// ⭐ New Helper: Formats date to DD/MM/YYYY
const formatDateDMY = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const OpportunityCard = ({ opp, status, fetchOpportunities }) => {
    const { user } = useAuth();
    const navigate = useNavigate()

    const handleApplyNow = async (opportunityId) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role === "NGO") {
            toast.error("You need a volunteer profile to apply");
            return;
        }

        if (user.role === "VOLUNTEER") {
            try {
                const loading = toast.loading("Submitting your application...");

                const res = await axios.post(
                    `${baseUrl}/applications`,
                    { opportunityId },
                    { withCredentials: true }
                );
                toast.dismiss(loading);
                toast.success(res.message);
                // ⭐ Re-fetch data to update the 'Apply Now' button to a status button
                fetchOpportunities();

            } catch (err) {
                toast.dismiss();
                if (err.response) {
                    toast.error(err.response.data.message || "Something went wrong");
                } else {
                    toast.error("Network error, please try again");
                }
                console.error(err);
            }
        }
    };
    // Use organizationName if available, fallback to fullName
    const ngoDetails = opp.ngoId;
    const ngoName = ngoDetails?.organizationName || ngoDetails?.fullName || "NGO";
    const postedDate = opp.createdAt;
    // Use profilePicUrl, fallback to a placeholder
    const profilePicUrl = ngoDetails?.profilePicUrl || 'https://via.placeholder.com/40?text=K';


    return (
        <div className="opportunity-card">
            {/* ⭐ FIX: Aligned Logo/Title Container */}
            <div className="card-header-info">
                <img src={profilePicUrl} alt={ngoName} className="ngo-profile-pic" />
                <span className="ngo-name-title">{ngoName}</span>
            </div>

            <div className="card-content-wrapper">
                <h3>{opp.title}</h3>
                <p className="description">{opp.description}</p>
            </div>

            <div className="skill-tags">
                {opp.requiredSkills?.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                ))}
            </div>

            <div className="card-footer-details">
                <div className="details-row">
                    <span className="detail-item location">📍 {opp.location}</span>
                    <span className="detail-item duration">🕒 {opp.duration}</span>
                </div>

                <div className="posted-by-row">
                    <span className="category-tag">Posted on:</span>
                    {/* ⭐ Date Format Fix */}
                    <span className="detail-item posted-date">🗓️ {formatDateDMY(postedDate)}</span>
                </div>
            </div>

            {user?.role !== 'NGO' && (
                status ? (
                    <button className={`status-button ${status} apply-button`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ) : (
                    <button onClick={() => handleApplyNow(opp._id)} className="apply-button">
                        Apply Now
                    </button>
                )
            )}
        </div>
    );
};

const Opportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth()
    const [myApps, setMyApps] = useState([]);

    // ⭐ NEW: Filter States
    const [selectedSkills, setSelectedSkills] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('');

    // Unique options for filters (Client-side population)
    const [skillOptions, setSkillOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [durationOptions, setDurationOptions] = useState([]);

    // const location = useLocation();

    // const [selectedOpportunityId, setSelectedOpportunityId] = useState('');
    // useEffect(()=>{
    //     const params = new URLSearchParams(location.search);
    //     const oid = params.get('opportunityId')

    //     if(oid) setSelectedOpportunityId=(oid);
    // },[location.search] )

    // Consolidated Fetch Function for Opportunities and User Applications
    const fetchOpportunities = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch Opportunities with Filters (Server-side)
            const queryParams = new URLSearchParams();
            if (selectedSkills) queryParams.append('skills', selectedSkills);
            if (selectedLocation) queryParams.append('location', selectedLocation);
            if (selectedDuration) queryParams.append('duration', selectedDuration);

            const queryString = queryParams.toString();
            const url = `${baseUrl}/opportunities${queryString ? '?' + queryString : ''}`;

            const oppRes = await axios.get(url, { withCredentials: true });
            const fetchedOpportunities = oppRes.data;
            setOpportunities(fetchedOpportunities);

            // Populate filter options (assuming initial fetch gets all options)
            const allSkills = new Set();
            const allLocations = new Set();
            const allDurations = new Set();

            fetchedOpportunities.forEach(opp => {
                opp.requiredSkills.forEach(s => allSkills.add(s.trim()));
                allLocations.add(opp.location.trim());
                allDurations.add(opp.duration.trim());
            });

            setSkillOptions(Array.from(allSkills).sort());
            setLocationOptions(Array.from(allLocations).sort());
            setDurationOptions(Array.from(allDurations).sort());


            // 2. Fetch User Applications (if Volunteer)
            if (user && user.role === 'VOLUNTEER') {
                const appRes = await axios.get(`${baseUrl}/applications/my`, { withCredentials: true });
                setMyApps(appRes.data);
            } else {
                setMyApps([]);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load opportunities or user data.");
        } finally {
            setLoading(false);
        }
    }, [user, selectedSkills, selectedLocation, selectedDuration]);

    // Initial fetch and refetch on filter change
    useEffect(() => {
        fetchOpportunities();
    }, [fetchOpportunities]);


    // Search/Filter Change Handlers
    const handleSkillChange = (e) => setSelectedSkills(e.target.value);
    const handleLocationChange = (e) => setSelectedLocation(e.target.value);
    const handleDurationChange = (e) => setSelectedDuration(e.target.value);

    const handleClearFilters = () => {
        setSelectedSkills('');
        setSelectedLocation('');
        setSelectedDuration('');
        setSearchTerm('');
    };


    // Client-side search for the search bar (acts on the currently displayed list)


    // const filteredOpportunities = opportunities.filter(opp => {
    //     const ngoName = opp.ngoId?.organizationName || opp.ngoId?.fullName || "";
    //     const lowerSearchTerm = searchTerm.toLowerCase();

    //     return (
    //         opp.title?.toLowerCase().includes(lowerSearchTerm) ||
    //         opp.location?.toLowerCase().includes(lowerSearchTerm) ||
    //         opp.description?.toLowerCase().includes(lowerSearchTerm) ||
    //         ngoName.toLowerCase().includes(lowerSearchTerm)
    //     );
    // });

    const searchedOpportunities = opportunities.filter(opp => {
        // const filteredOpportunities = opportunities.filter((opp) => {
            const ngoName = opp.ngoId?.organizationName || opp.ngoId?.fullName || "";
            // const lowerSearchTerm = searchTerm.toLowerCase();

            const searchableFields = [
                opp.title,
                opp.location,
                opp.description,
                ngoName,
                ...(Array.isArray(opp.requiredSkills) ? opp.requiredSkills : [])
            ].map((f) => f?.toLowerCase() || "");

            const keywords = searchTerm
                .toLowerCase()
                .split(/[\s,]+/) 
                .filter(Boolean); 

            // return (
            //     opp.title?.toLowerCase().includes(lowerSearchTerm) ||
            //     opp.location?.toLowerCase().includes(lowerSearchTerm) ||
            //     opp.description?.toLowerCase().includes(lowerSearchTerm) ||
            //     ngoName.toLowerCase().includes(lowerSearchTerm) ||
            //     opp.requiredSkills?.some(skill => skill.toLowerCase().includes(lowerSearchTerm))


            // check if every keyword is found in any field
            return keywords.every((keyword) =>
                searchableFields.some((field) => field.includes(keyword))
            );
        });
    // })
    const appMap = myApps.reduce((acc, app) => {
        acc[app.opportunityId._id] = app.status; // store status by oppId
        return acc;
    }, {});


    return (
        <div className="opportunities-page-container">
            <main className="opportunities-content">
                <h1>Browse <span className="highlight-text">Opportunities</span></h1>
                <p className="subtitle">
                    Find the perfect opportunity to make a difference with your skills
                </p>

                <div className="filter-and-search-container">

                    <div className="search-bar-container">
                        <input
                            type="text"
                            placeholder="🔍 Search by Title, Location, or NGO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filters-row">
                        <select value={selectedSkills} onChange={handleSkillChange}>
                            <option value="">Filter by Skills</option>
                            {skillOptions.map(skill => (
                                <option key={skill} value={skill}>{skill}</option>
                            ))}
                        </select>

                        <select value={selectedLocation} onChange={handleLocationChange}>
                            <option value="">Filter by Location</option>
                            {locationOptions.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>

                        <select value={selectedDuration} onChange={handleDurationChange}>
                            <option value="">Filter by Duration</option>
                            {durationOptions.map(dur => (
                                <option key={dur} value={dur}>{dur}</option>
                            ))}
                        </select>

                        <button onClick={handleClearFilters} className="clear-filters-btn">Clear Filters</button>
                    </div>

                </div>

                {loading ? (
                    <p className="no-results">Loading opportunities...</p>
                ) : (
                    <div className="opportunities-grid">
                        {searchedOpportunities.length > 0 ? (
                            searchedOpportunities.map((opp) => (
                                <OpportunityCard
                                    key={opp._id}
                                    opp={opp}
                                    status={appMap[opp._id]}
                                    fetchOpportunities={fetchOpportunities} // Pass refetch function
                                />
                            ))
                        ) : (
                            <p className="no-results">No opportunities found matching your search or filters.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
export default Opportunities;