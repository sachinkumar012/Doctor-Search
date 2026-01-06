document.addEventListener('DOMContentLoaded', () => {
    const doctorGrid = document.getElementById('doctorGrid');
    const resultsCount = document.getElementById('resultsCount');
    const searchForm = document.getElementById('searchForm');

    // Inputs
    const searchInput = document.getElementById('searchInput');
    const locationInput = document.getElementById('locationInput');
    const specializationInput = document.getElementById('specializationInput');

    // Filters
    const availableCheck = document.getElementById('availableCheck');
    const experienceFilter = document.getElementById('experienceFilter');
    const feeFilter = document.getElementById('feeFilter');
    const resetBtn = document.getElementById('resetFilters');

    // Fetch Doctors
    const fetchDoctors = async () => {
        resultsCount.innerText = 'Searching...';

        const params = new URLSearchParams();
        if (searchInput.value) params.append('query', searchInput.value);
        if (locationInput.value) params.append('location', locationInput.value);
        if (specializationInput.value) params.append('specialization', specializationInput.value);

        if (availableCheck.checked) params.append('available', 'true');
        if (experienceFilter.value !== 'all') params.append('experience', experienceFilter.value);
        if (feeFilter.value !== 'all') params.append('fee', feeFilter.value);

        try {
            const response = await fetch(`/api/doctors?${params.toString()}`);
            const doctors = await response.json();
            renderDoctors(doctors);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            doctorGrid.innerHTML = '<p class="error-msg">Failed to load doctors. Please try again.</p>';
        }
    };

    // Render Doctors
    const renderDoctors = (doctors) => {
        doctorGrid.innerHTML = '';

        if (doctors.length === 0) {
            resultsCount.innerText = 'No doctors found';
            doctorGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fa-solid fa-user-doctor" style="font-size: 48px; color: var(--text-light); margin-bottom: 16px;"></i>
                    <h3>No doctors found matching your criteria</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }

        resultsCount.innerText = `${doctors.length} Doctors Available Near You`;

        doctors.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doctor-card';

            // Create stars HTML
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(doc.rating)) {
                    starsHtml += '<i class="fa-solid fa-star"></i>';
                } else if (i === Math.ceil(doc.rating) && !Number.isInteger(doc.rating)) {
                    starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
                } else {
                    starsHtml += '<i class="fa-regular fa-star"></i>';
                }
            }

            card.innerHTML = `
                <div style="position: relative;">
                    <img src="${doc.image}" alt="${doc.name}" class="card-image">
                    ${doc.available ? '<span style="position: absolute; top: 12px; right: 12px;" class="available-badge">Available Today</span>' : ''}
                </div>
                <div class="card-content">
                    <div class="doc-header">
                        <div>
                            <h3 class="doc-name">${doc.name}</h3>
                            <div class="doc-specialty">${doc.specialization}</div>
                        </div>
                        <div class="doc-rating">
                            ${starsHtml}
                            <span style="color: var(--text-gray); font-weight: 400; font-size: 13px;">(${doc.rating})</span>
                        </div>
                    </div>
                    
                    <div class="doc-info">
                        <div class="info-item">
                            <i class="fa-solid fa-briefcase-medical"></i>
                            <span>${doc.experience} Experience</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${doc.location}</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-hospital"></i>
                            <span>${doc.hospital}</span>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-wallet"></i>
                            <span style="color: var(--text-dark); font-weight: 600;">₹${doc.fee} Consultation Fee</span>
                        </div>
                    </div>
                    
                    <div class="doc-actions">
                        <a href="profile.html?id=${doc._id}" class="btn btn-outline" style="text-align: center; display: flex; align-items: center; justify-content: center;">View Profile</a>
                        <a href="profile.html?id=${doc._id}" class="btn btn-primary" style="text-align: center; display: flex; align-items: center; justify-content: center;">Book Now</a>
                    </div>
                </div>
            `;

            doctorGrid.appendChild(card);
        });
    };

    // Event Listeners
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchDoctors();
    });

    // Auto-filter on change
    locationInput.addEventListener('change', fetchDoctors);
    specializationInput.addEventListener('change', fetchDoctors);
    availableCheck.addEventListener('change', fetchDoctors);
    experienceFilter.addEventListener('change', fetchDoctors);
    feeFilter.addEventListener('change', fetchDoctors);

    resetBtn.addEventListener('click', () => {
        searchForm.reset();
        // Reset manual filters not in form
        availableCheck.checked = false;
        experienceFilter.value = 'all';
        feeFilter.value = 'all';
        fetchDoctors();
    });

    // Initial Load
    fetchDoctors();
});
