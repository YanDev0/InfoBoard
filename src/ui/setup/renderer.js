(() => {
    const top = document.querySelector("#top");
    const middle = document.querySelector("#middle");

    /** @type {NodeListOf<HTMLObjectElement>} */
    const inputs = middle.querySelectorAll("input");
    /** @type {Electron.Display | null} */
    let externalDisplay = null;
    /** @type {"top" | "middle" | "bottom" | "end"} */
    let stepPos;

    // Animasi awal
    setTimeout(() => top.classList.add("show"), 100);

    // Tombol kembali
    document.querySelectorAll(".back").forEach(ele => {
        ele.addEventListener("click", () => {
            showPage(ele.parentElement, ele.parentElement.previousElementSibling);
        });
    });

    // Tombol lanjutkan
    document.querySelectorAll(".lanjutkan").forEach(ele => {
        ele.onclick = () => {
            // Pada middle, berisi pengisian forms.
            // Jangan lanjutkan step jika input required tidak valid.
            if (middle.classList.contains("show")) {
                for (const input of inputs) {
                    if (!input.validity.valid) return input.reportValidity();
                }
            }

            showPage(ele.parentElement, ele.parentElement.nextElementSibling);
        };
    });

    // Beberapa fungsi tersendiri untuk step setup
    onPageShow(part => {
        stepPos = part.id;

        // Buka front demo jika external display sudah terhubung dari tadi 
        if (stepPos == "bottom" && externalDisplay) {
            window.front.open();
        } else window.front.close();
    });

    // Tambahkan data display primary dan eksternal
    window.display.primaryDisplay().then(display => {
        updateDisplayInfo(document.querySelector(".display.number-0"), display);
    });
    window.display.externalDisplay().then(updateExternalDisplayInfo);
    // Dengarkan display eksternal
    window.display.onExternalDisplay(display => {
        if (stepPos == "bottom" && display) {
            window.front.open();
        } else if (stepPos == "bottom" && !display) {
            window.front.close();
        }

        updateExternalDisplayInfo(display);
    });

    // Dengarkan perubahaan zoom front
    document.querySelector("#zoomFront").onchange = (e) => {
        let float = parseFloat(e.target.value);

        if (isNaN(float) || float > 5) {
            float = e.target.value = 5;
        }

        window.front.changeZoom(float);
    }

    /** Dengarkan jika sebuah bagian website muncul */
    function onPageShow(callback) {
        const observer = new MutationObserver(mutasis => {
            mutasis.forEach(mutasi => {
                if (mutasi.type == "attributes" && mutasi.attributeName == "class") {
                    const element = mutasi.target;
                    if (element.classList.contains("show")) {
                        callback(element)
                    }
                }
            })
        });

        // Observe kemunculan halaman
        document.querySelectorAll(".container-fluid")
            .forEach(e => observer.observe(e, { attributes: true, attributeFilter: ["class"] }));
    }

    /**
     * @param {Element} oldEle 
     * @param {Element} newEle
     */ 
    function showPage(oldEle, newEle) {
        oldEle.classList.replace("show", "hide");
        if (newEle.classList.contains("hide")) {
            oldEle.classList.remove("hide");
            newEle.classList.replace("hide", "show");
        } else {
            newEle.classList.add("show");
        }
    }

    /** @param {Electron.Display | null} display */
    function updateExternalDisplayInfo(display) {
        externalDisplay = display;
        
        const alert = document.querySelector(".display-alert");
        const bottomContinue = document.querySelector(".when-external-show");
        
        if (display) {
            bottomContinue.classList.remove("d-none");
            alert.classList.add("d-none");
        } else {
            bottomContinue.classList.add("d-none");
            alert.classList.remove("d-none");
        }
        
        updateDisplayInfo(document.querySelector(".display.number-1"), display);
    }

    /**
     * @param {Element} element 
     * @param {Electron.Display | null} display 
     */
    function updateDisplayInfo(element, display) { 
        const actualWidth = (display?.size.width * display?.scaleFactor)?.toFixed(0);
        const actualHeight = (display?.size.height * display?.scaleFactor)?.toFixed(0);
        
        element.querySelector(".label").innerText = display?.label || "Tidak diketahui";
        element.querySelector(".size").innerText = (display?.size) ?
            `${actualWidth - 1}x${actualHeight - 1}`
            : "0000x0000";
        element.removeChild(element.querySelector(".status"));
        element.innerHTML += (display)
            ? '<span class="status badge text-bg-success">Terhubung</span>'
            : '<span class="status badge text-bg-danger">Terputus</span>';
    }
})();