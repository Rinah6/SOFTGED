import { apiUrl } from '../../apiConfig.js';
import userStateManager from '../../store.js';

let roles = [];

let projects = [];

let connectedUserRole = -1;

let creationState = true;

const loader = $('#loader');

async function getStatistique() {
    const { data } = await axios.get(apiUrl + `api/User/statistique`, {
        withCredentials: true
    });

    const icon_max = !data.max_user ? `<i class="fa-solid fas fa-infinity"></i>` : data.max_user;
    const reste_user = !data.reste_user ? `<i class="fa-solid fas fa-infinity"></i>` : data.reste_user;

    $("#max_user").html(icon_max);
    $("#curr_user").html(data.curr_user);
    $("#reste_user").html(reste_user);
}

async function getRoles() {
    const { data } = await axios.get(apiUrl + 'api/users/roles', {
        withCredentials: true
    });

    roles = data;
};

function showListRole(data) {
    let code = ``;

    $.each(data, function (_, role) {
        code += `<option value="${role.id}">${role.title}</option>`;
    });

    $(`#roles`).html(code);
}

async function getProjects() {
    const { data: projects } = await axios.get(apiUrl + `api/projects`, {
        withCredentials: true
    });

    let content = `
        <option value="" selected></option>
    `;

    for (let i = 0; i < projects.length; i += 1) {
        content += `
            <option value="${projects[i].id}">${projects[i].name}</option>
        `;
    }

    $('#projects').html(content).select2({
        dropdownParent: $('#user-modal')
    });
}

async function getUsers() {
    const { data } = await axios.get(apiUrl + `api/users`, {
        withCredentials: true
    });

    let code = ``;

    $.each(data, function (_, user) {
        const userRole = roles.find(role => role.id === user.role).title;

        code += `
            <tr data-type="user-cell">
                <td>${user.username}</td>
                <td>${user.lastName}</td>
                <td>${user.firstName}</td>
                <td>${user.email}</td>
                <td>${userRole}</td>
                <td><button class="btn btn-primary" user-update="${user.id}">Modifier</button></td>
                <td><button class="btn btn-danger" user-delete="${user.id}">Supprimer</button></td>
            </tr>
        `;
    });

    $(`#liste_user`).html(code);
}

async function getUser(userId) {
    const { data: user } = await axios.get(apiUrl + `api/users/${userId}`, {
        withCredentials: true
    });

    $('#username').val(user.username);
    $('#first-name').val(user.firstName);
    $('#last-name').val(user.lastName);
    $('#email').val(user.email);
    $('#roles').val(user.role).trigger('change');
    $('#projects').val(user.projectId).trigger('change');
}

async function deleteUser(userId) {
    await axios.delete(apiUrl + `api/users/${userId}`, {
        withCredentials: true
    });

    Toast.fire({
        icon: 'success',
        title: "Utilisateur supprimé!"
    });

    window.location.reload();
}

$(document).ready(async () => {
    try {
        loader.removeClass('display-none');

        await userStateManager.init();

        const { role, hasAccessToInternalUsersHandling } = userStateManager.getUser();

        if (role !== 0 && role !== 1 || !hasAccessToInternalUsersHandling) {
            window.location.href = webUrl + `404`;

            return;
        }

        connectedUserRole = role;

        await getRoles();

        await getUsers();

        await getProjects();

        await getStatistique();
    } catch (error) {
        alert(error.message);
    } finally {
        loader.addClass('display-none');
    }
});

$('#wsearch').on("keyup", function () {
    const value = $(this).val().toLowerCase();

    $(`[data-type="user-cell"]`).filter(function () {
        const parent = $(this).closest(`[data-type="user-cell"]`);

        parent.toggle(parent.text().toLowerCase().indexOf(value) > -1);
    });
});

$(`[new-user-modal]`).on('click', async (e) => {
    $('#username').val('');
    $('#last-name').val('');
    $("#first-name").val('');
    $('#email').val('');
    $('#password').val('');

    if (connectedUserRole === 0 || connectedUserRole === 1) {
        $('#modal-title').text(`Insertion d'un nouvel utilisateur`);

        if (connectedUserRole === 0) {
            $('#roles-container').hide();
        } else {
            $('#projects-container').hide();

            $('#roles').val('-1');
        }

        if (connectedUserRole === 1) {
            await getRoles();

            showListRole(roles);

            $(`[data-id="projects-container]`).remove();
        }

        creationState = true;

        $('#user-modal').modal('toggle');
    }
});

$(document).on('click', '[user-update]', async (e) => {
    $('#password').val('');

    const id = $(e.currentTarget).attr('user-update');

    if (connectedUserRole === 0 || connectedUserRole === 1) {
        await getRoles();

        showListRole(roles);

        await getUser(id);

        $('#modal-title').text(`Modification d'un utilisateur`);

        if (connectedUserRole === 0) {
            $('#roles-container').remove();
        } else {
            $('#projects-container').hide();
        }

        creationState = false;

        $('#user-modal').modal('toggle');
        $('#user-modal').find('[data-action="submit"]').attr('data-id', id);
    }
});

$('#user-modal').find('[data-action="submit"]').on('click', async () => {
    const username = $('#username').val();
    const firstName = $('#first-name').val();
    const lastName = $('#last-name').val();
    const email = $('#email').val();
    const password = $('#password').val();
    const role = $('#roles').val();
    const projectId = $('#projects').val();

    if (creationState) {
        if (username === '' || password === '') {
            Toast.fire({
                icon: 'error',
                title: "Le nom d'utilisateur et le mot de passe sont obligatoires!"
            });

            return;
        }

        try {
            loader.removeClass('display-none');

            await axios.post(apiUrl + `api/users/register`, {
                username,
                firstName,
                lastName,
                email,
                password,
                role: connectedUserRole === 0 ? 1 : !role ? 3 : Number(role),
                projectId: connectedUserRole === 0 ? projectId : undefined,
                projects
            }, {
                withCredentials: true
            });

            Toast.fire({
                icon: 'success',
                title: `Utilisateur inséré!`
            });

            window.location.reload();
        } catch (error) {
            alert(`L'utilisateur ${username} existe déjà!`);
        } finally {
            loader.addClass('display-none');
        }
    } else {
        if (email === '') {
            Toast.fire({
                icon: 'error',
                title: "L'email est obligatoire!"
            });

            return;
        }

        const id = $('#user-modal').find('[data-action="submit"]').attr('data-id');

        try {
            loader.removeClass('display-none');    

            await axios.patch(apiUrl + `api/users/${id}`, {
                username,
                firstName,
                lastName,
                email,
                password,
                role: connectedUserRole === 0 ? 1 : !role ? 3 : Number(role),
                projectId: connectedUserRole === 0 ? projectId : ''
            }, {
                withCredentials: true
            });

            $('#user-modal').find('[data-action="submit"]').attr('data-id', '0')

            Toast.fire({
                icon: 'success',
                title: `Utilisateur modifié!`
            });

            window.location.reload();
        } catch (error) {
            alert(error.message);
        } finally {
            loader.addClass('display-none');
        }
    }

    $("#user-modal").modal("hide");
});

$(document).on('click', '[user-delete]', async (e) => {
    const header = $(e.target).closest(`[user-delete]`);
    const id = header.attr("user-delete");

    if (confirm('Êtes-vous sûre de supprimer?')) {
        await deleteUser(id);
    }
});

$('[data-bs-dismiss="modal"]').on('click', () => {
    $('#projects-container').val('').trigger('change');
});
