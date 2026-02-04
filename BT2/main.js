async function LoadData() {
    let res = await fetch("http://localhost:3000/posts")
    let posts = await res.json();
    let body = document.getElementById("body_table");
    body.innerHTML = '';
    for (const post of posts) {
        let strikethrough = post.isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
        body.innerHTML += `<tr ${strikethrough}>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>
                <input type="submit" value="Edit" onclick="Edit(${post.id})"/>
                <input type="submit" value="${post.isDeleted ? 'Restore' : 'Delete'}" onclick="Delete(${post.id})"/>
            </td>
        </tr>`
    }
    LoadComments();
}

async function LoadComments() {
    let res = await fetch("http://localhost:3000/comments")
    let comments = await res.json();
    let body = document.getElementById("comments_body");
    if (!body) return;
    body.innerHTML = '';
    for (const comment of comments) {
        let strikethrough = comment.isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
        body.innerHTML += `<tr ${strikethrough}>
            <td>${comment.id}</td>
            <td>${comment.text}</td>
            <td>${comment.postId}</td>
            <td>
                <input type="submit" value="Edit" onclick="EditComment(${comment.id})"/>
                <input type="submit" value="${comment.isDeleted ? 'Restore' : 'Delete'}" onclick="DeleteComment(${comment.id})"/>
            </td>
        </tr>`
    }
}
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    
    if (!title || !views) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return false;
    }

    if (id) {
        // Update
        let getItem = await fetch('http://localhost:3000/posts/' + id)
        if (getItem.ok) {
            let res = await fetch('http://localhost:3000/posts/'+id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    views: views
                })
            });
            if (res.ok) {
                console.log("Cập nhật thành công");
                document.getElementById("id_txt").value = '';
                document.getElementById("title_txt").value = '';
                document.getElementById("view_txt").value = '';
                LoadData();
            }
        } else {
            alert("Post ID không tồn tại. Vui lòng bỏ trống ID để tạo mới hoặc nhập ID chính xác.");
        }
    } else {
        // Create new
        let allPosts = await fetch('http://localhost:3000/posts').then(r => r.json());
        let maxId = Math.max(...allPosts.map(p => parseInt(p.id)), 0);
        let newId = String(maxId + 1);
        
        try {
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: newId,
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Tạo mới thành công");
                document.getElementById("id_txt").value = '';
                document.getElementById("title_txt").value = '';
                document.getElementById("view_txt").value = '';
                LoadData();
            }
        } catch (error) {
            console.log(error);
        }
    }
    return false;
}

async function Edit(id) {
    let res = await fetch('http://localhost:3000/posts/' + id)
    if (res.ok) {
        let post = await res.json();
        document.getElementById("id_txt").value = post.id;
        document.getElementById("title_txt").value = post.title;
        document.getElementById("view_txt").value = post.views;
    }
}

async function Delete(id) {
    let res = await fetch("http://localhost:3000/posts/" + id)
    if (res.ok) {
        let post = await res.json();
        // Toggle soft delete
        let updateRes = await fetch("http://localhost:3000/posts/" + id, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                isDeleted: !post.isDeleted
            })
        })
        if (updateRes.ok) {
            console.log(post.isDeleted ? "Khôi phục thành công" : "Xóa thành công");
        }
    }
    LoadData();
    return false;
}

// Comments CRUD
async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;
    
    if (!text || !postId) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return false;
    }

    if (id) {
        // Update
        let updateRes = await fetch('http://localhost:3000/comments/'+id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                postId: postId
            })
        });
        if (updateRes.ok) {
            console.log("Cập nhật comment thành công");
            document.getElementById("comment_id_txt").value = '';
            document.getElementById("comment_text_txt").value = '';
            document.getElementById("comment_postId_txt").value = '';
            LoadData();
        } else {
            alert("Comment ID không tồn tại. Vui lòng bỏ trống ID để tạo mới");
        }
    } else {
        // Create new
        let allComments = await fetch('http://localhost:3000/comments').then(r => r.json());
        let maxId = Math.max(...allComments.map(c => parseInt(c.id)), 0);
        let newId = String(maxId + 1);
        
        try {
            let res = await fetch('http://localhost:3000/comments', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: newId,
                    text: text,
                    postId: postId,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Tạo comment mới thành công");
                document.getElementById("comment_id_txt").value = '';
                document.getElementById("comment_text_txt").value = '';
                document.getElementById("comment_postId_txt").value = '';
                LoadData();
            }
        } catch (error) {
            console.log(error);
        }
    }
    return false;
}

async function EditComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id)
    if (res.ok) {
        let comment = await res.json();
        document.getElementById("comment_id_txt").value = comment.id;
        document.getElementById("comment_text_txt").value = comment.text;
        document.getElementById("comment_postId_txt").value = comment.postId;
    }
}

async function DeleteComment(id) {
    let res = await fetch("http://localhost:3000/comments/" + id)
    if (res.ok) {
        let comment = await res.json();
        // Toggle soft delete
        let updateRes = await fetch("http://localhost:3000/comments/" + id, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                isDeleted: !comment.isDeleted
            })
        })
        if (updateRes.ok) {
            console.log(comment.isDeleted ? "Khôi phục comment thành công" : "Xóa comment thành công");
        }
    }
    LoadData();
    return false;
}
LoadData();