type IStep = "top" | "middle" | "bottom" | "end";

(() => {
    const containers: NodeListOf<HTMLDivElement> = document.querySelectorAll(".container-fluid");
    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll("input");

    const tombolLanjutkan: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".lanjutkan");
    const tombolKembali: NodeListOf<HTMLDivElement> = document.querySelectorAll(".back");

    let externalDisplay: (Electron.Display | null);
    let stepPos: IStep;

    // Fungsinasi tombol lanjutkan dan kembali
    tombolKembali.forEach(ele => {
        ele.onclick = () => showPart(ele, ele.getAttribute("data-to") as IStep);
    });
    tombolLanjutkan.forEach(ele => {
        const localInputs = ele.parentElement.querySelectorAll("input");

        ele.onclick = () => {            
            if (localInputs.length) for (let i = 0; i < localInputs.length; i++) {
                const input = localInputs.item(i);
                if (!input.validity.valid) return input.reportValidity();
            }

            if (ele.classList.contains("end")) {
                const values: IConfigs = {};

                if (inputs.length) inputs.forEach(input => {
                    switch (input.type) {
                        case "file":
                            values[input.id] = input.files[0].path;
                        break;

                        case "checkbox":
                            values[input.id] = input.checked;
                        break;

                        case "number":
                            values[input.id] = +input.value;
                        break;

                        default:
                            values[input.id] = input.value;
                        break;
                    }
                });

                console.log(values);
            } else {
                showPart(ele, ele.getAttribute("data-to") as IStep);
            }
        }
    });

    // Beberapa fungsi tersendiri untuk step setup
    onPageShow(part => {
        stepPos = part.id as IStep;

        // Buka front demo jika external display sudah terhubung dari tadi 
        if (stepPos == "bottom" && externalDisplay) {
            window.front.open();
        } else {
            window.front.close();
        }
    });

    // Tambahkan data display primary dan eksternal
    window.display.primaryDisplay().then(display => updateDisplayInfo(0, display));
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
    const zoomElement: HTMLInputElement = document.querySelector("#zoomFront");
    zoomElement.onchange = () => {
        let float = parseFloat(zoomElement.value);

        if (isNaN(float) || float > 5) {
            float = 5;
            zoomElement.value = String(float);
        }

        window.front.changeZoom(float);
    }

    // Functions
    /** Dengarkan obeserver jika sedang terjadi perpindahan step */
    function onPageShow(callback: (element: Element) => void) {
        const observer = new MutationObserver(mutasis => {
            mutasis.forEach(mutasi => {
                if (mutasi.type == "attributes" && mutasi.attributeName == "class") {
                    const element = mutasi.target as Element;
                    if (element.classList.contains("show")) {
                        callback(element)
                    }
                }
            });
        });

        // Observe kemunculan halaman
        containers
            .forEach(e => observer.observe(e, { attributes: true, attributeFilter: ["class"] }));
    }

    /** Perlihatkan step sebelum atau selanjutnya */
    function showPart(button: HTMLElement, to: IStep) {
        const parentID = button.getAttribute("data-parent");
        const parent = document.querySelector(`#${parentID}.container-fluid`);
        const nextParent = document.querySelector(`#${to}`);

        parent.classList.replace("show", "hide");
        if (nextParent.classList.contains("hide")) {
            parent.classList.remove("hide");
            nextParent.classList.replace("hide", "show");
        } else {
            nextParent.classList.add("show");
        }
    }

    /** Perbarui informasi display eksternal */
    function updateExternalDisplayInfo(display: Electron.Display | null) {
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
        
        updateDisplayInfo(1, display);
    }

    function updateDisplayInfo(number: number, display: Electron.Display | null) {
        const element = document.querySelector(`.display.number-${number}`);

        const actualWidth = (display) 
            ? +(display.size.width * display.scaleFactor).toFixed(0)
            : 0;
        const actualHeight = (display)
            ? +(display.size.height * display.scaleFactor).toFixed(0)
            : 0;
        
        (element.querySelector(".label") as HTMLElement).innerHTML = display?.label || "Tidak diketahui";
        (element.querySelector(".size") as HTMLElement).innerText = (display?.size) ?
            `${actualWidth - 1}x${actualHeight - 1}`
            : "0000x0000";
        element.removeChild(element.querySelector(".status"));
        element.innerHTML += (display)
            ? '<span class="status badge text-bg-success">Terhubung</span>'
            : '<span class="status badge text-bg-danger">Terputus</span>';
    }
})();