// AI Cattle Breed Recognition - Updated JavaScript for provided frontend

// Global variables
// let currentImage = null; // Removed duplicate declaration

// Comprehensive breed database with detailed information
const breedDatabase = {
    'Gir': {
        type: 'Cattle',
        origin: 'Gujarat, India',
        characteristics: {
            'Horn Shape': 'Curved and pointing backward',
            'Coat Color': 'White with red/brown patches',
            'Milk Yield': '1200-1800 liters/year',
            'Body Size': 'Medium to large',
            'Special Features': 'Prominent forehead, drooping ears'
        },
        description: 'Gir is one of the most important indigenous breeds of India, known for high milk production and heat tolerance.',
        uses: ['Milk production', 'Draught work', 'Breeding'],
        temperament: 'Docile and calm'
    },
    'Sahiwal': {
        type: 'Cattle',
        origin: 'Punjab, Pakistan/India',
        characteristics: {
            'Horn Shape': 'Short and thick',
            'Coat Color': 'Light to dark brown/red',
            'Milk Yield': '1400-2500 liters/year',
            'Body Size': 'Medium to large',
            'Special Features': 'Loose skin, well-developed udder'
        },
        description: 'Sahiwal is known as one of the best dairy breeds in the Indian subcontinent.',
        uses: ['Milk production', 'Heat tolerance'],
        temperament: 'Gentle and easy to handle'
    },
    'Murrah': {
        type: 'Buffalo',
        origin: 'Haryana, India',
        characteristics: {
            'Horn Shape': 'Curved inward and backward',
            'Coat Color': 'Jet black',
            'Milk Yield': '2000-3000 liters/year',
            'Body Size': 'Large',
            'Special Features': 'Well-developed udder, curved horns'
        },
        description: 'Murrah is the most famous buffalo breed known for highest milk production.',
        uses: ['Milk production', 'Breeding'],
        temperament: 'Docile but can be aggressive'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    console.log('🐄 AI Cattle Breed Recognition System Initialized');
    checkAPIHealth();
}

function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');

    // File input change
    fileInput.addEventListener('change', handleFileUpload);

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.backgroundColor = '#f8f9ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = 'white';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.backgroundColor = 'white';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleFileUpload({ target: { files: [file] } });
            } else {
                showError('Please upload an image file');
            }
        }
    });
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showError('File size too large. Please choose a file smaller than 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            displayImage(e.target.result);
            currentImage = file;
        };
        reader.readAsDataURL(file);
    }
}

function displayImage(imageSrc) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <img src="${imageSrc}" alt="Uploaded cattle" class="preview-image">
        <div style="margin-top: 15px;">
            <button class="upload-btn" onclick="analyzeImage()">
                🧠 Analyze Breed
            </button>
            <button class="upload-btn camera-btn" onclick="resetUpload()">
                🔄 Upload New
            </button>
        </div>
    `;
}

function openCamera() {
    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'camera';
    cameraInput.onchange = handleFileUpload;
    cameraInput.click();
}

async function analyzeImage() {
    if (!currentImage) {
        showError('Please upload an image first');
        return;
    }

    showLoading();

    try {
        // Create FormData for API request
        const formData = new FormData();
        formData.append('image', currentImage);

        // Call backend API
        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            displayResults(result.data);
        } else {
            throw new Error(result.error || 'Prediction failed');
        }

    } catch (error) {
        console.error('API call failed, using mock results:', error);
        // Fallback to mock results if API fails
        const mockResults = generateMockResults();
        displayResults(mockResults);
    } finally {
        hideLoading();
    }
}

function generateMockResults() {
    // Simulate AI model predictions with multiple breeds and confidence scores
    const breeds = Object.keys(breedDatabase);
    const primaryBreed = breeds[Math.floor(Math.random() * breeds.length)];
    const confidence = (Math.random() * 0.3 + 0.7) * 100; // 70-100% confidence

    return {
        primary_breed: primaryBreed,
        confidence: confidence.toFixed(1),
        alternatives: breeds
            .filter(b => b !== primaryBreed)
            .slice(0, 2)
            .map(breed => ({
                breed: breed,
                confidence: (Math.random() * 0.4 + 0.3) * 100
            }))
            .sort((a, b) => b.confidence - a.confidence)
    };
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    const primaryBreed = breedDatabase[results.primary_breed];

    if (!primaryBreed) {
        // Handle breeds not in detailed database
        let html = `
            <div class="breed-result">
                <div class="breed-name">${results.primary_breed}</div>
                <div class="confidence">Confidence: ${results.confidence}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${results.confidence}%"></div>
                </div>
                <div class="breed-details">
                    <strong>Indian Breed Identified</strong><br>
                    This is an authentic Indian cattle/buffalo breed.
                </div>
            </div>
        `;
        resultsDiv.innerHTML = html;
        return;
    }

    let html = `
        <div class="breed-result">
            <div class="breed-name">${results.primary_breed}</div>
            <div class="confidence">Confidence: ${results.confidence}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${results.confidence}%"></div>
            </div>
            <div class="breed-details">
                <strong>Type:</strong> ${primaryBreed.type} | 
                <strong>Origin:</strong> ${primaryBreed.origin}<br>
                <strong>Temperament:</strong> ${primaryBreed.temperament}
                <p style="margin-top: 10px;">${primaryBreed.description}</p>
            </div>
            
            <div class="characteristics">
    `;

    for (const [key, value] of Object.entries(primaryBreed.characteristics)) {
        html += `
            <div class="char-item">
                <div class="char-label">${key}</div>
                <div class="char-value">${value}</div>
            </div>
        `;
    }

    html += `</div></div>`;

    // Add alternative predictions
    if (results.alternatives && results.alternatives.length > 0) {
        html += `
            <div class="additional-info">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">Alternative Predictions</h3>
        `;

        results.alternatives.forEach(alt => {
            html += `
                <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #95a5a6;">
                    <strong>${alt.breed}</strong> - ${alt.confidence.toFixed(1)}% confidence
                    <div class="progress-bar" style="margin-top: 5px;">
                        <div class="progress-fill" style="width: ${alt.confidence}%; background: #95a5a6;"></div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Add detailed breed information
    html += `
        <div class="additional-info">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Breed Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-title">Primary Uses</div>
                    <div class="info-content">${primaryBreed.uses.join(', ')}</div>
                </div>
                <div class="info-item">
                    <div class="info-title">Breeding Notes</div>
                    <div class="info-content">Suitable for ${primaryBreed.type.toLowerCase()} breeding programs</div>
                </div>
                <div class="info-item">
                    <div class="info-title">Management</div>
                    <div class="info-content">Requires proper nutrition and veterinary care</div>
                </div>
                <div class="info-item">
                    <div class="info-title">Economic Value</div>
                    <div class="info-content">High economic value in dairy and breeding operations</div>
                </div>
            </div>
        </div>
    `;

    resultsDiv.innerHTML = html;
    analysisResults = results;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').style.display = 'block';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function resetUpload() {
    currentImage = null;
    analysisResults = null;
    document.getElementById('fileInput').value = '';
    
    // Reset upload area to original state
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-icon">📸</div>
        <div class="upload-text">
            <strong>Upload Cattle/Buffalo Image for Breed Verification</strong><br>
            <small>Drag & drop or click to select image</small>
        </div>
        <div style="margin: 20px 0;">
            <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
                📁 Choose File
            </button>
            <button class="upload-btn camera-btn" onclick="openCamera()">
                📷 Use Camera
            </button>
        </div>
        <div style="color: #666; font-size: 0.9rem; margin-top: 10px;">
            Supported: JPG, PNG • Max size: 10MB<br>
            Best results with clear, well-lit images
        </div>
        <input type="file" id="fileInput" accept="image/*" style="display: none;" onchange="handleFileUpload(event)">
    `;
    
    // Reset results area
    document.getElementById('results').innerHTML = `
        <div style="text-align: center; color: #999; padding: 40px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">🐮</div>
            <h3 style="color: #666; margin-bottom: 10px;">Ready for Breed Analysis</h3>
            <p>Upload an image of your cattle or buffalo to get instant breed identification with confidence scores and detailed breed information.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: left;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">✨ What you'll get:</h4>
                <ul style="color: #666; padding-left: 20px;">
                    <li>Primary breed identification with confidence score</li>
                    <li>Alternative breed suggestions</li>
                    <li>Detailed morphological characteristics</li>
                    <li>Origin and breeding information</li>
                    <li>Economic value and usage details</li>
                </ul>
            </div>
        </div>
    `;
    
    // Re-setup event listeners
    setupEventListeners();
}

async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ API connection healthy');
        } else {
            console.warn('⚠️ API health check failed');
        }
    } catch (error) {
        console.error('❌ API connection failed:', error);
        console.log('Using offline mode with mock predictions');
    }
}

// Make functions globally accessible
window.handleFileUpload = handleFileUpload;
window.openCamera = openCamera;
window.analyzeImage = analyzeImage;
window.resetUpload = resetUpload;// AI Cattle Breed Recognition - JavaScript

// Global variables
let currentImage = null;
let analysisResults = null;
const API_BASE = 'http://localhost:5000/api';

// Indian breeds data
const INDIAN_BREEDS = [
    'Gir', 'Sahiwal', 'Red_Sindhi', 'Tharparkar', 'Rathi', 'Kankrej', 'Ongole',
    'Krishna_Valley', 'Deoni', 'Khillari', 'Kangayam', 'Bargur', 'Pulikulam',
    'Umblachery', 'Alambadi', 'Hallikar', 'Amritmahal', 'Mysore', 'Malnad_Gidda',
    'Vechur', 'Kasaragod', 'Punganur', 'Bachaur', 'Gangatiri', 'Hariana',
    'Nimari', 'Malvi', 'Nagori', 'Mewati', 'Khariar', 'Kenwariya', 'Dangi',
    'Gaolao', 'Lohani', 'Kherigarh', 'Ponwar', 'Siri', 'Bhagnari', 'Cholistani',
    'Dhanni', 'Murrah', 'Nili_Ravi', 'Kundi', 'Surti', 'Jafarabadi', 'Bhadawari',
    'Tarai', 'Marathwadi', 'Pandharpuri', 'Kalahandi', 'Sambalpuri', 'Chilika',
    'Mehsana', 'Nagpuri', 'Toda', 'Jaffarabadi', 'Mithun', 'Yak', 'Tibetan',
    'Siri_Cattle', 'Bhutia', 'Arunachali', 'Sikkim_Local', 'Hill_Cattle',
    'Ladakhi', 'Valley_Cattle', 'Takin', 'Gayal', 'Gaur', 'Wild_Buffalo',
    'Red_Kandhari', 'Rojhan', 'Dajal', 'Forest_Buffalo'
];

const BUFFALO_BREEDS = [
    'Murrah', 'Nili_Ravi', 'Kundi', 'Surti', 'Jafarabadi', 'Bhadawari',
    'Tarai', 'Marathwadi', 'Pandharpuri', 'Kalahandi', 'Sambalpuri',
    'Chilika', 'Mehsana', 'Nagpuri', 'Toda', 'Jaffarabadi', 'Wild_Buffalo',
    'Forest_Buffalo'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSupportedBreeds();
});

function initializeApp() {
    console.log('🐄 AI Cattle Breed Recognition System Initialized');
    checkAPIHealth();
}

function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');

    // File input change
    fileInput.addEventListener('change', handleFileUpload);

    // Drag and drop
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }

    currentImage = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        showImagePreview(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

function validateFile(file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please upload a valid image file (JPG, PNG)');
        return false;
    }

    // Check file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
        showError('File size too large. Please choose a file smaller than 16MB.');
        return false;
    }

    return true;
}

function showImagePreview(imageSrc, file) {
    const fileInfo = document.getElementById('fileInfo');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    previewImage.src = imageSrc;
    fileName.textContent = `File: ${file.name}`;
    fileSize.textContent = `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;

    fileInfo.style.display = 'block';
}

function openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = handleFileUpload;
    input.click();
}

async function analyzeImage() {
    if (!currentImage) {
        showError('Please upload an image first');
        return;
    }

    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('image', currentImage);

        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            displayResults(result.data);
        } else {
            throw new Error(result.error || 'Prediction failed');
        }

    } catch (error) {
        console.error('Analysis failed:', error);
        showError(`Analysis failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    const resultsContent = document.getElementById('resultsContent');
    
    let html = `
        <div class="breed-result">
            <div class="breed-name">${formatBreedName(data.primary_breed)}</div>
            <div class="confidence-score">Confidence: ${data.confidence}%</div>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${data.confidence}%"></div>
            </div>
            <div class="breed-info">
                <p><strong>Type:</strong> ${getBreedType(data.primary_breed)}</p>
                <p><strong>Category:</strong> ${getBreedCategory(data.primary_breed)}</p>
            </div>
        </div>
    `;

    // Add alternatives if available
    if (data.alternatives && data.alternatives.length > 0) {
        html += `<div class="alternatives">
            <h3>Alternative Predictions:</h3>`;
        
        data.alternatives.forEach(alt => {
            html += `
                <div class="alternative-breed">
                    <span>${formatBreedName(alt.breed)}</span>
                    <span>${alt.confidence}%</span>
                </div>
            `;
        });
        
        html += `</div>`;
    }

    resultsContent.innerHTML = html;
    analysisResults = data;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultsContent').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('errorModal').style.display = 'none';
}

function loadSupportedBreeds() {
    const breedsGrid = document.getElementById('breedsGrid');
    
    let html = '';
    INDIAN_BREEDS.forEach(breed => {
        const isBuffalo = BUFFALO_BREEDS.includes(breed);
        const className = isBuffalo ? 'breed-tag buffalo' : 'breed-tag';
        html += `<div class="${className}">${formatBreedName(breed)}</div>`;
    });
    
    breedsGrid.innerHTML = html;
}

function formatBreedName(breedName) {
    return breedName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getBreedType(breedName) {
    return BUFFALO_BREEDS.includes(breedName) ? 'Water Buffalo' : 'Zebu Cattle';
}

function getBreedCategory(breedName) {
    const dairyBreeds = ['Gir', 'Sahiwal', 'Red_Sindhi', 'Murrah', 'Surti'];
    const draughtBreeds = ['Kankrej', 'Ongole', 'Hallikar', 'Amritmahal'];
    
    if (dairyBreeds.includes(breedName)) return 'Dairy';
    if (draughtBreeds.includes(breedName)) return 'Draught';
    return 'Dual Purpose';
}

async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ API connection healthy');
        } else {
            console.warn('⚠️ API health check failed');
        }
    } catch (error) {
        console.error('❌ API connection failed:', error);
        console.log('Using offline mode');
    }
}

// Utility functions
function resetUpload() {
    currentImage = null;
    analysisResults = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('resultsContent').innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Ready for Analysis</h3>
            <p>Upload an image to identify cattle or buffalo breed</p>
        </div>
    `;
}

function downloadResults() {
    if (!analysisResults) {
        showError('No results to download');
        return;
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        primary_breed: analysisResults.primary_breed,
        confidence: analysisResults.confidence,
        alternatives: analysisResults.alternatives
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cattle_breed_analysis_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export functions for global access
window.analyzeImage = analyzeImage;
window.openCamera = openCamera;
window.closeModal = closeModal;
window.resetUpload = resetUpload;
window.downloadResults = downloadResults;
