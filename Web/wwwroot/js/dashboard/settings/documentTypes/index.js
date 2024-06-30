import { apiUrl } from '../../../apiConfig.js';
import userStateManager from '../../../store.js';
import { setUsers, users } from './global.js';

const loader = $('#loader');

const steps = $('#steps');

let stepsList = [];

$(document).ready(async () => {
    try {
        loader.removeClass('display-none');

        await userStateManager.init();

        const { role, hasAccessToDocumentTypesHandling } = userStateManager.getUser();

        if (role !== 1 || !hasAccessToDocumentTypesHandling) {
            // window.location.href = webUrl + `404`;

            return;
        }

        const { data: documentTypes } = await axios.get(apiUrl + `api/document_types`, {
            withCredentials: true
        });

        let content = '';

        for (let i = 0; i < documentTypes.length; i += 1) {
            content += `
                <li data-document-type-id="${documentTypes[i].id}" class="document-type">
                    <span>${documentTypes[i].title}</span>
                </li>
            `;
        }

        $('#document-types-list').html(content);

        const { data: usersByProjectId } = await axios.get(apiUrl + `api/projects/users`, {
            withCredentials: true
        });
    
        setUsers(usersByProjectId);
    } catch (error) {
        console.log(error);
    } finally {
        loader.addClass('display-none');
    }
});

$('#add-document-type').on('click', async () => {
    steps.html('');

    $('#add-document-type-modal').modal('toggle');
});

$('#close-add-document-type-modal').on('click', () => {
    steps.html('');

    $('#add-document-type-modal').modal('toggle');
});

$('#add-step-btn').on('click', () => {
    stepsList.push({
        id: Date.now(),
        stepNumber: stepsList.length + 1,
        processingDuration: 0,
        usersId: []
    });

    const newStep = stepsList[stepsList.length - 1];

    steps.append(`
        <li id="${newStep.id}" style="margin-bottom: 20px; ">
            <span data-type="stepNumber">Étape ${stepsList.length}</span>

            <div>
                <div>
                    <label for="processing-duration-${newStep.id}">Durée de traitement (en heures): </label>
                    <input type="number" id="processing-duration-${newStep.id}" value="${newStep.processingDuration}" min="0" />
                </div>

                <div>
                    <label for="users-${newStep.id}">Validateurs: </label>
                    <select id="users-${newStep.id}" name="users-${newStep.id}[]" multiple="multiple" style="width: 200px;"></select>
                </div>
            </div>
        </li>
    `);

    let content = `<option value=""></option>`;

    for (let i = 0; i < users.length; i += 1) {
        content += `
            <option value="${users[i].id}">${users[i].username}</option>
        `;
    }

    steps.find(`#users-${newStep.id}`).html(content).select2({
        dropdownParent: $('#add-document-type-modal')
    });
});

$('#post-document-type').on('click', async () => {
    if ($('#new-document-type-label').val() === '') {
        alert(`L'étiquette est obligatoire!`);

        return;
    }

    try {
        loader.removeClass('display-none');

        for (let i = 0; i < stepsList.length; i += 1) {
            if (steps.find(`#users-${stepsList[i].id}`).val().length === 0) {
                alert(`L'étape ${stepsList[i].stepNumber} doit contenir au moins un validateur!`);

                loader.addClass('display-none');

                return;
            }

            stepsList[i] = {
                ...stepsList[i],
                processingDuration: Number(steps.find(`#processing-duration-${stepsList[i].id}`).val()), 
                usersId: steps.find(`#users-${stepsList[i].id}`).val()
            }
        }

        await axios.post(apiUrl + `api/document_types`, {
            title: $('#new-document-type-label').val(),
            steps: stepsList.map((step) => {
                return {
                    stepNumber: step.stepNumber,
                    processingDuration: step.processingDuration,
                    usersId: step.usersId,
                };
            })
        }, {
            withCredentials: true
        });

        window.location.reload();
    } catch (error) {
        console.log(error.message);
    } finally {
        loader.addClass('display-none');
    }
});
