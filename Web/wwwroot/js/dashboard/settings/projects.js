import { apiUrl, webUrl } from '../../apiConfig.js';
import userStateManager from '../../store.js';

const loader = $('#loader');

let projects = [];

function renderProjects() {
    let content = '';

    for (let i = 0; i < projects.length; i += 1) {
        content += `
            <option value="${projects[i].id}">${projects[i].name}</option>
        `;
    }

    $('#projects-container').html(`
        <label for="projects">Projets interagissants : </label>
        <select id="projects" name="projects[]" multiple="multiple" class="form-control" style="width: 300px;"></select>
    `);

    $('#projects-container').find('#projects').html(content).select2({
        dropdownParent: $('#update-project-modal')
    });
}

async function getProjects() {
    const { data } = await axios.get(apiUrl + `api/projects`, {
        withCredentials: true
    });

    let code = ``;

    $.each(data, function (_, v) {
        code += `
            <tr data-type="project-cell">
                <td>${v.id}</td>
                <td>${v.name}</td>
                <td>${v.storage}</td>
                <td><button class="btn btn-primary" show-update-project-modal="${v.id}">Modifer</button></td>
                <td><button class="btn btn-danger" delete-project="${v.id}">Supprimer</button></td>
            </tr>
        `;
    });

    $(`#liste_user`).html(code);

    $("#societe_nombre").html(Number(data.length))
}

async function getProjectDetails(projectId) {
    loader.removeClass('display-none');

    const { data } = await axios.get(apiUrl + `api/projects/${projectId}`, {
        withCredentials: true
    });

    $("#current-name").val(data.name);
    $("#current-storage").val(data.storage);
    $('#has-access-to-internal-users-handling').prop('checked', data.hasAccessToInternalUsersHandling);
    $('#has-access-to-suppliers-handling').prop('checked', data.hasAccessToSuppliersHandling);
    $('#has-access-to-processing-circuits-handling').prop('checked', data.hasAccessToProcessingCircuitsHandling);
    $('#has-access-to-sign-myself-feature').prop('checked', data.hasAccessToSignMySelfFeature);
    $('#has-access-to-archive-immediately-feature').prop('checked', data.hasAccessToArchiveImmediatelyFeature);
    $('#has-access-to-global-dynamic-fields-handling').prop('checked', data.hasAccessToGlobalDynamicFieldsHandling);
    $('#has-access-to-physical-location-handling').prop('checked', data.hasAccessToPhysicalLocationHandling);
    $('#has-access-to-numeric-library').prop('checked', data.hasAccessToNumericLibrary);
    $('#has-access-to-tomate-db-connection').prop('checked', data.hasAccessToTomProLinking);
    $('#has-access-to-users-connections-information').prop('checked', data.hasAccessToUsersConnectionsInformation);
    $('#has-access-to-document-types-handling').prop('checked', data.hasAccessToDocumentTypesHandling);
    $('#has-access-to-documents-accesses-handling').prop('checked', data.hasAccessToDocumentsAccessesHandling);
    $('#has-access-to-rsf').prop('checked', data.hasAccessToRSF);
    
    loader.addClass('display-none');
}

async function deleteProject(projectId) {
    await axios.delete(apiUrl + `api/projects/${projectId}`, {
        withCredentials: true
    });

    window.location.reload();
}

$(document).ready(async () => {
    try {
        loader.removeClass('display-none');

        await userStateManager.init();

        const { role } = userStateManager.getUser();

        if (role !== 0) {
            window.location.href = webUrl + `404`;

            return;
        }

        await getProjects();
    } catch (error) {
        alert(error.message);
    } finally {
        loader.addClass('display-none');
    }
});

$('#wsearch').on('keyup', function () {
    const value = $(this).val().toLowerCase();

    $(`[data-type="project-cell"]`).filter(function () {
        const parent = $(this).closest(`[data-type="project-cell"]`);

        parent.toggle(parent.text().toLowerCase().indexOf(value) > -1);
    });
});

$(document).on('click', '[create-project]', async() => {
    let name = $('#name').val();
    let storage = $("#storage").val();

    if (name == '') {
        Toast.fire({
            icon: 'error',
            title: "Le nom est obligatoire."
        });

        return;
    }

    try {
        loader.removeClass('display-none');

        await axios.post(apiUrl + `api/projects`, {
            name,
            storage
        }, {
            withCredentials: true
        });

        Toast.fire({
            icon: 'success',
            title: `Projet insérée!`
        });

        window.location.reload();
    } catch (error) {
        alert(error.message);
    } finally {
        loader.addClass('display-none');
    }

    $('#create-project-modal').modal('hide');
});

$(document).on('click', '[user-modal]', (e) => {
    $('#name').val('');
    $('#project').val('');
    $('#storage').val('');

    $('#create-project-modal').modal('toggle');
});

$(document).on('click', '[modal-closed]', (e) => {
    $('#create-project-modal').modal('hide');
});

$(document).on('click', '[show-update-project-modal]', async (e) => {
    loader.removeClass('display-none');

    const currentElement = $(e.target).closest(`[show-update-project-modal]`);
    const id = currentElement.attr('show-update-project-modal');
    
    await getProjectDetails(id);

    renderProjects();

    loader.addClass('display-none');

    $("#update-project-modal").modal('toggle');

    $('#update-project-modal').find('button[type="submit"]').attr('update-project', id);
});

$('#update-project-modal').find('button[type="submit"]').on('click', async (e) => {
    const id = $(e.target).attr('update-project');
    const name = $("#current-name").val();
    const hasAccessToInternalUsersHandling = $('#has-access-to-internal-users-handling').prop('checked');
    const hasAccessToSuppliersHandling = $('#has-access-to-suppliers-handling').prop('checked');
    const HasAccessToProcessingCircuitsHandling = $('#has-access-to-processing-circuits-handling').prop('checked');
    const hasAccessToSignMySelfFeature = $('#has-access-to-sign-myself-feature').prop('checked');
    const hasAccessToArchiveImmediatelyFeature = $('#has-access-to-archive-immediately-feature').prop('checked');
    const hasAccessToGlobalDynamicFieldsHandling = $('#has-access-to-global-dynamic-fields-handling').prop('checked');
    const hasAccessToPhysicalLocationHandling = $('#has-access-to-physical-location-handling').prop('checked');
    const hasAccessToNumericLibrary = $('#has-access-to-numeric-library').prop('checked');
    const hasAccessToTomProLinking = $('#has-access-to-tomate-db-connection').prop('checked');
    const hasAccessToUsersConnectionsInformation = $('#has-access-to-users-connections-information').prop('checked');
    const hasAccessToDocumentTypesHandling = $('#has-access-to-document-types-handling').prop('checked');
    const hasAccessToDocumentsAccessesHandling = $('#has-access-to-documents-accesses-handling').prop('checked');
    const hasAccessToRSF = $('#has-access-to-rsf').prop('checked');

    loader.removeClass('display-none');

    try {
        await axios.patch(apiUrl + `api/projects/${id}`, {
            name,
            hasAccessToInternalUsersHandling,
            hasAccessToSuppliersHandling,
            HasAccessToProcessingCircuitsHandling,
            hasAccessToSignMySelfFeature,
            hasAccessToArchiveImmediatelyFeature,
            hasAccessToGlobalDynamicFieldsHandling,
            hasAccessToPhysicalLocationHandling,
            hasAccessToNumericLibrary,
            hasAccessToTomProLinking,
            hasAccessToUsersConnectionsInformation,
            hasAccessToDocumentTypesHandling,
            hasAccessToDocumentsAccessesHandling,
            hasAccessToRSF,
        }, {
            withCredentials: true
        });

        Toast.fire({
            icon: 'success',
            title: `Projet mise à jour!`
        });

        window.location.reload();
    } catch (error) {
        Toast.fire({
            icon: 'error',
            title: error.message
        });
    } finally {
        loader.addClass('display-none');;
    }
});

$(document).on('click', '[delete-project]', async (e) => {
    const header = $(e.target).closest(`[delete-project]`);
    const id = header.attr("delete-project");

    if (confirm('Êtes-vous sûr(e) de supprimer cet utilisateur ?')) {
        await deleteProject(id);
    }
});
