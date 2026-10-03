"use strict";

/* =========================================================
   SHINMIRAI WEB BUILDER
   Main Application Controller
========================================================= */

const Builder = {
   state: {
    selected: null,
    elements: [],
    nextId: 1,

    codeTab: "html",
    preview: "desktop",

    history: [],
    historyIndex: -1,
    restoringHistory: false
},
    elements: {},

    fields: {},

    init() {
        this.cacheElements();
        this.registerTemplates();
        this.bindEvents();
        this.updateCode();

        console.log(
            "ShinMirai Web Builder initialized."
        );
    },
    /* =====================================================
   HISTORY
===================================================== */

saveHistory() {

    if (this.state.restoringHistory) {
        return;
    }

    const snapshot = this.createSnapshot();

    const current =
        this.state.history[
            this.state.historyIndex
        ];

    if (
        current &&
        current === snapshot
    ) {
        return;
    }

    this.state.history =
        this.state.history.slice(
            0,
            this.state.historyIndex + 1
        );

    this.state.history.push(
        snapshot
    );

    this.state.historyIndex =
        this.state.history.length - 1;

    this.updateHistoryButtons();
},

createSnapshot() {

    return JSON.stringify({
        nextId: this.state.nextId,

        elements:
            this.state.elements.map(item => ({
                id: item.id,
                type: item.type,
                html:
                    item.element.outerHTML
            }))
    });
},

undo() {

    if (
        this.state.historyIndex <= 0
    ) {
        return;
    }

    this.state.historyIndex--;

    this.restoreSnapshot(
        this.state.history[
            this.state.historyIndex
        ]
    );
},

redo() {

    if (
        this.state.historyIndex >=
        this.state.history.length - 1
    ) {
        return;
    }

    this.state.historyIndex++;

    this.restoreSnapshot(
        this.state.history[
            this.state.historyIndex
        ]
    );
},

restoreSnapshot(snapshot) {

    if (!snapshot) return;

    const data =
        JSON.parse(snapshot);

    this.state.restoringHistory =
        true;

    this.state.elements.forEach(
        item => item.element.remove()
    );

    this.state.elements = [];

    this.state.selected = null;

    this.state.nextId =
        data.nextId;

    data.elements.forEach(item => {

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.innerHTML =
            item.html;

        const element =
            wrapper.firstElementChild;

        if (!element) return;

        element.dataset.builderId =
            item.id;

        element.dataset.elementType =
            item.type;

        this.prepareElement(
            element
        );

        this.dom.canvas.appendChild(
            element
        );

        this.state.elements.push({
            id: item.id,
            type: item.type,
            element
        });
    });

    this.state.restoringHistory =
        false;

    this.clearSelection();

    this.updateLayers();

    this.updateCode();

    this.updateHistoryButtons();
},

updateHistoryButtons() {

    const undo =
        document.getElementById(
            "undoButton"
        );

    const redo =
        document.getElementById(
            "redoButton"
        );

    if (undo) {
        undo.disabled =
            this.state.historyIndex <= 0;
    }

    if (redo) {
        redo.disabled =
            this.state.historyIndex >=
            this.state.history.length - 1;
    }
},

    /* =====================================================
       CACHE DOM ELEMENTS
    ===================================================== */

    cacheElements() {
        this.dom = {
            canvas: document.getElementById("canvas"),
            canvasEmpty:
                document.getElementById("canvasEmpty"),

            properties:
                document.getElementById("properties"),

            propertiesEmpty:
                document.getElementById(
                    "propertiesEmpty"
                ),

            contentProperties:
                document.getElementById(
                    "contentProperties"
                ),

            styleProperties:
                document.getElementById(
                    "styleProperties"
                ),

            codeOutput:
                document.querySelector(
                    "#codeOutput code"
                ),

            projectStatus:
                document.getElementById(
                    "projectStatus"
                )
        };

        this.fields = {
            text:
                document.getElementById(
                    "elementText"
                ),

            size:
                document.getElementById(
                    "elementSize"
                ),

            align:
                document.getElementById(
                    "elementAlign"
                ),

            width:
                document.getElementById(
                    "elementWidth"
                ),

            height:
                document.getElementById(
                    "elementHeight"
                ),

            fontFamily:
                document.getElementById(
                    "fontFamily"
                ),

            fontWeight:
                document.getElementById(
                    "fontWeight"
                ),

            lineHeight:
                document.getElementById(
                    "lineHeight"
                ),

            letterSpacing:
                document.getElementById(
                    "letterSpacing"
                ),

            textColor:
                document.getElementById(
                    "textColor"
                ),

            backgroundColor:
                document.getElementById(
                    "backgroundColor"
                ),

            borderWidth:
                document.getElementById(
                    "borderWidth"
                ),

            borderStyle:
                document.getElementById(
                    "borderStyle"
                ),

            borderColor:
                document.getElementById(
                    "borderColor"
                ),

            borderRadius:
                document.getElementById(
                    "borderRadius"
                ),

            margin:
                document.getElementById(
                    "elementMargin"
                ),

            padding:
                document.getElementById(
                    "elementPadding"
                )
        };
    },

    /* =====================================================
       ELEMENT TEMPLATES
    ===================================================== */

    registerTemplates() {

        this.elements = {

            heading: () => {
                const el =
                    document.createElement("h1");

                el.textContent =
                    "Your Heading";

                return el;
            },

            paragraph: () => {
                const el =
                    document.createElement("p");

                el.textContent =
                    "Your paragraph text goes here.";

                return el;
            },

            button: () => {
                const el =
                    document.createElement(
                        "button"
                    );

                el.type = "button";
                el.textContent = "Click Me";

                return el;
            },

            link: () => {
                const el =
                    document.createElement("a");

                el.href = "#";
                el.textContent =
                    "Learn More";

                return el;
            },

            divider: () => {
                return document.createElement(
                    "hr"
                );
            },

            section: () => {

                const section =
                    document.createElement(
                        "section"
                    );

                const heading =
                    document.createElement(
                        "h2"
                    );

                heading.textContent =
                    "Section";

                const paragraph =
                    document.createElement(
                        "p"
                    );

                paragraph.textContent =
                    "Section content.";

                section.append(
                    heading,
                    paragraph
                );

                return section;
            },

            container: () => {

                const container =
                    document.createElement(
                        "div"
                    );

                container.className =
                    "builder-container";

                container.textContent =
                    "Container";

                return container;
            },

            columns: () => {

                const columns =
                    document.createElement(
                        "div"
                    );

                columns.className =
                    "builder-columns";

                const column1 =
                    document.createElement(
                        "div"
                    );

                column1.textContent =
                    "Column 1";

                const column2 =
                    document.createElement(
                        "div"
                    );

                column2.textContent =
                    "Column 2";

                columns.append(
                    column1,
                    column2
                );

                return columns;
            },

            image: () => {

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    "data:image/svg+xml," +
                    encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg"
                             width="600"
                             height="300">
                            <rect width="100%"
                                  height="100%"
                                  fill="#eeeeee"/>
                            <text x="50%"
                                  y="50%"
                                  text-anchor="middle"
                                  dominant-baseline="middle"
                                  font-family="Arial"
                                  font-size="28">
                                Image
                            </text>
                        </svg>
                    `);

                image.alt =
                    "Website image";

                return image;
            },

            video: () => {

                const video =
                    document.createElement(
                        "video"
                    );

                video.controls = true;

                video.setAttribute(
                    "aria-label",
                    "Video"
                );

                return video;
            },

            input: () => {

                const input =
                    document.createElement(
                        "input"
                    );

                input.type = "text";

                input.placeholder =
                    "Enter text...";

                return input;
            },

            textarea: () => {

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.placeholder =
                    "Enter your message...";

                return textarea;
            },

            checkbox: () => {

                const label =
                    document.createElement(
                        "label"
                    );

                const checkbox =
                    document.createElement(
                        "input"
                    );

                checkbox.type =
                    "checkbox";

                label.append(
                    checkbox,
                    document.createTextNode(
                        " I agree"
                    )
                );

                return label;
            },

            form: () => {

                const form =
                    document.createElement(
                        "form"
                    );

                const input =
                    document.createElement(
                        "input"
                    );

                input.type = "text";

                input.placeholder =
                    "Your name";

                const button =
                    document.createElement(
                        "button"
                    );

                button.type = "submit";

                button.textContent =
                    "Submit";

                form.append(
                    input,
                    button
                );

                return form;
            }
        };
    },

    /* =====================================================
       EVENT REGISTRATION
    ===================================================== */

    bindEvents() {

        document
            .querySelectorAll(
                ".element-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.addElement(
                            button.dataset.element
                        );
                    }
                );
            });


        Object.values(
            this.fields
        ).forEach(field => {

            if (!field) return;

            field.addEventListener(
                "input",
                () => {
                    this.applyProperties();
                }
            );

            field.addEventListener(
                "change",
                () => {
                    this.applyProperties();
                }
            );
        });


        document
            .querySelectorAll(
                ".property-tab"
            )
            .forEach(tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        this.switchPropertyTab(
                            tab.dataset.panel
                        );
                    }
                );
            });


        document
            .querySelectorAll(
                ".code-tab"
            )
            .forEach(tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        this.switchCodeTab(
                            tab.dataset.code
                        );
                    }
                );
            });


        document
            .querySelectorAll(
                ".preview-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.setPreviewMode(
                            button.dataset.preview
                        );
                    }
                );
            });


        document
            .getElementById(
                "newProject"
            )
            ?.addEventListener(
                "click",
                () => {
                    this.newProject();
                }
            );


        document
            .getElementById(
                "saveProject"
            )
            ?.addEventListener(
                "click",
                () => {
                    this.saveProject();
                }
            );


        document
            .getElementById(
                "exportProject"
            )
            ?.addEventListener(
                "click",
                () => {
                    this.exportProject();
                }
            );


        this.dom.canvas
            ?.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        this.dom.canvas
                    ) {
                        this.clearSelection();
                    }
                }
                
            );
            document.addEventListener(
    "keydown",
    event => {

        const tag =
            document.activeElement?.tagName;

        const editing =
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT";

        if (editing) return;

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "z"
        ) {
            event.preventDefault();

            if (event.shiftKey) {
                this.redo();
            } else {
                this.undo();
            }
        }

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "y"
        ) {
            event.preventDefault();

            this.redo();
        }

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "d"
        ) {
            event.preventDefault();

            this.duplicateSelected();
        }

        if (
            event.key === "Delete"
        ) {
            this.deleteSelected();
        }
    }
);
    },

    /* =====================================================
       ADD ELEMENT
    ===================================================== */

    addElement(type) {

        const factory =
            this.elements[type];

        if (!factory) {
            console.warn(
                `Unknown element: ${type}`
            );

            return;
        }

        const element =
            factory();

        const id =
            `builder-${this.state.nextId++}`;

        element.dataset.builderId =
            id;

        element.dataset.elementType =
            type;

        this.prepareElement(
            element
        );

        this.dom.canvasEmpty?.remove();

        this.dom.canvas.appendChild(
            element
        );

        this.state.elements.push({
            id,
            type,
            element
        });

        this.selectElement(
            element
        );

        this.setStatus(
            "Unsaved Changes"
        );

        this.updateCode();
    },

    /* =====================================================
       PREPARE ELEMENT
    ===================================================== */

    prepareElement(element) {

        element.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                this.selectElement(
                    element
                );
            }
        );
    },

    /* =====================================================
       SELECT
    ===================================================== */

    selectElement(element) {

        if (this.state.selected) {

            this.state.selected
                .classList
                .remove(
                    "builder-element"
                );
        }

        this.state.selected =
            element;

        element.classList.add(
            "builder-element"
        );

        this.dom.properties.hidden =
            false;

        if (
            this.dom.propertiesEmpty
      