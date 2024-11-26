/**
 * Functionality for templates/covers
 */
import 'jquery-ui/ui/disable-selection';
import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui-touch-punch'; // this makes drag-to-reorder work on touch devices

import { closePopup } from './utils';

//cover/change.html
export function initCoversChange() {
    // Pull data from data-config of class "manageCovers" in covers/manage.html
    const data_config_json = $('.manageCovers').data('config');
    const doc_type_key = data_config_json['key'];
    const add_url = data_config_json['add_url'];
    const manage_url = data_config_json['manage_url'];

    // Add iframes lazily when the popup is loaded.
    // This avoids fetching the iframes along with main page.
    $('.coverPop')
        .on('click', function () {
            // clear the content of #imagesAdd and #imagesManage before adding new
            $('.imagesAdd').html('');
            $('.imagesManage').html('');
            if (doc_type_key === '/type/work') {
                // Add iframe to manage images
                add_iframe('.imagesManage', manage_url);
            }
            setTimeout(function () {
                // Add iframe to manage images
                add_iframe('.imagesAdd', add_url);
            }, 0);
        })
        .on('cbox_cleanup', function () {
            $('.imagesAdd').html('');
            $('.imagesManage').html('');
        });
}

// add iframe to manage images
function add_iframe(selector, src) {
    $(selector)
        .append('<iframe frameborder="0" height="580" width="580" marginheight="0" marginwidth="0" scrolling="auto"></iframe>')
        .find('iframe')
        .attr('src', src);
}

// covers/manage.html and covers/add.html
export function initCoversAddManage() {
    $('.ol-cover-form').on('submit', function () {
        const loadingIndicator = document.querySelector('.loadingIndicator');
        const formDivs = document.querySelectorAll('.ol-cover-form, .imageIntro');

        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
            formDivs.forEach(div => div.classList.add('hidden'));
        }
    });

    $('.column').sortable({
        connectWith: '.trash'
    });
    $('.trash').sortable({
        connectWith: '.column'
    });
    $('.column').disableSelection();
    $('.trash').disableSelection();

    // Add drag and drop functionality
    document.addEventListener("DOMContentLoaded", function () {
        const dropZone = document.getElementById("drop-zone");
        const fileList = document.getElementById("file-list");
      
        // Handle drag and drop events
        dropZone.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("dragover");
        });
      
        dropZone.addEventListener("dragleave", (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("dragover");
        });
      
        dropZone.addEventListener("drop", (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("dragover");
          handleFiles(e.dataTransfer.files);
        });
      
        // Handle click to upload
        dropZone.addEventListener("click", () => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.multiple = true;
          fileInput.addEventListener("change", () => handleFiles(fileInput.files));
          fileInput.click();
        });
      
        // Display uploaded files
        function handleFiles(files) {
          const ul = document.createElement("ul");
          fileList.innerHTML = ""; // Clear existing list
          Array.from(files).forEach((file) => {
            const li = document.createElement("li");
            li.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            ul.appendChild(li);
          });
          fileList.appendChild(ul);
        }
      });

    function updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        // First time - remove the prompt
        if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
        }

        // First time - there is no thumbnail element, so let's create it
        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Show thumbnail for image files
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
            };
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }
}

// covers/saved.html
// Uses parent.$ in place of $ where elements lie outside of the "saved" window
export function initCoversSaved() {
    // Save the new image
    // Pull data from data-config of class "imageSaved" in covers/saved.html
    const data_config_json = parent.$('.manageCovers').data('config');
    const doc_type_key = data_config_json['key'];
    const coverstore_url = data_config_json['url'];
    const cover_selector = data_config_json['selector'];
    const image = $('.imageSaved').data('imageId');
    var cover_url;

    $('.popClose').on('click', closePopup);

    // Update the image for the cover
    if (['/type/edition', '/type/work', '/edit'].includes(doc_type_key)) {
        if (image) {
            cover_url = `${coverstore_url}/a/id/${image}-M.jpg`;
            parent.$(cover_selector).attr('src', cover_url);
        }
        else {
            // hide SRPCover and show SRPCoverBlank
            parent.$(cover_selector)
                .parents('div:first').hide()
                .next().show();
        }
    }
    else {
        if (image) {
            cover_url = `${coverstore_url}/a/id/${image}-M.jpg`;
        }
        else {
            cover_url = '/images/icons/avatar_author-lg.png';
        }
        parent.$(cover_selector).attr('src', cover_url);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Add drag and drop functionality
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
        });

        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
                inputElement.closest('form').submit(); // Submit the form after file is selected
            }
        });

        dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        });

        ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

        dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();

            if (e.dataTransfer.files.length) {
                const fileList = new DataTransfer();
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                    fileList.items.add(e.dataTransfer.files[i]);
                }
                inputElement.files = fileList.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
                inputElement.closest('form').submit(); // Submit the form after file is dropped
            }

            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    function updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        // First time - remove the prompt
        if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
        }

        // First time - there is no thumbnail element, so let's create it
        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Show thumbnail for image files
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
            };
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }
});
