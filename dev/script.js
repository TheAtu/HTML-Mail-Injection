const dropzoneBox = document.getElementsByClassName("dropzone-box")[0];

const inputFiles = document.querySelectorAll(
  ".dropzone-area input[type='file']"
);

const inputElement = inputFiles[0];

const dropZoneElement = inputElement.closest(".dropzone-area");

inputElement.addEventListener("change", (e) => {
  if (inputElement.files.length) {
    updateDropzoneFileList(dropZoneElement, inputElement.files[0]);
    document.getElementById('upload-icon').classList.add('uploaded');
  }
});

dropZoneElement.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZoneElement.classList.add("dropzone--over");
});

["dragleave", "dragend"].forEach((type) => {
  dropZoneElement.addEventListener(type, (e) => {
    dropZoneElement.classList.remove("dropzone--over");
  });
});

dropZoneElement.addEventListener("drop", (e) => {
  e.preventDefault();

  if (e.dataTransfer.files.length) {
    inputElement.files = e.dataTransfer.files;

    
    updateDropzoneFileList(dropZoneElement, e.dataTransfer.files[0]);


  }

  dropZoneElement.classList.remove("dropzone--over");
});

const updateDropzoneFileList = (dropzoneElement, file) => {
  let dropzoneFileMessage = dropzoneElement.querySelector(".message");
  
  dropzoneFileMessage.innerHTML = `
        ${file.name}, ${file.size} bytes
    `;
    
};

dropzoneBox.addEventListener("reset", (e) => {
  let dropzoneFileMessage = dropZoneElement.querySelector(".message");

  dropzoneFileMessage.innerHTML = `No Files Selected`;

  document.getElementById('upload-icon').classList.remove('uploaded');
});

dropzoneBox.addEventListener("submit", (e) => {
  e.preventDefault();
  const myFiled = document.getElementById("upload-file");
  console.log(myFiled.files[0]); 
  // THIS SHOULD TRIGGER NEW ELEMENT IS DRAG LIST
  const file = myFiled.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const htmlContent = e.target.result;
    triggerInjection(htmlContent)
    // Save the HTML content to storage
    chrome.storage.local.set({ 'htmlContent': htmlContent });
  };
  reader.readAsText(file);
});

//// INJECTION ////
document.getElementById('insert_last-button').addEventListener('click', function() {
  chrome.storage.local.get('htmlContent', function(data) {
      if (data.htmlContent) {
        // If stored HTML content exists, enable the "Inject Last HTML" button
        triggerInjection(data.htmlContent);
      };
    });
});

function triggerInjection(htmlContent){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: injectHTML,
        args: [htmlContent]
    });
  });
}

function injectHTML(htmlContent) {
  // Find the compose message area in Gmail. This might be specific to Gmail's current layout and could change.
  // Look for the 'contenteditable' attribute which is commonly used in rich text editors.
  const posibleComposeAreas = document.querySelectorAll('[contenteditable="true"]');
  const composeArea = Array.from(posibleComposeAreas).pop();;
  
  if (composeArea) {
      // If a compose message area is found, inject the HTML content.
      composeArea.innerHTML = htmlContent;
  } else {
      // Optionally, alert the user or handle cases where the compose area is not found.
      console.error("Could not find the compose message area.");
  }
}



// Add event listener for Preview button
document.getElementById('preview-button').addEventListener('click', (e) => {
  e.preventDefault();
  console.log
  const myFile = inputElement.files[0];
  if (!myFile) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const htmlContent = e.target.result;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };
  reader.readAsText(myFile);
});
