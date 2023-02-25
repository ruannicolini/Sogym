export const API_URL = "https://dogsapi.origamid.dev/json";
export const API_SOGYM_URL = "http://localhost:3333";

// Cadastrar um usuario
export function USER_POST(body) {
  return {
    url: API_URL + "/api/user",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  };
}

// Envia as fotos do formulario para a API
export function PHOTO_POST(formData, token) {
  return {
    url: API_URL + "/api/photo",
    options: {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    },
  };
}

// Solicita as fotos da API de acordo com os parametros passados
export function PHOTOS_GET({ page, total, user }) {
  return {
    url: `${API_URL}/api/photo/?_page=${page}&_total=${total}&_user=${user}`,
    options: {
      method: "GET",
      cache: "no-store",
    },
  };
}

// Solicita a foto da API de acordo com o ID
export function PHOTO_GET(id) {
  return {
    url: `${API_URL}/api/photo/${id}`,
    options: {
      method: "GET",
      cache: "no-store",
    },
  };
}

// Solicita a foto da API de acordo com o ID
export function COMMENT_POST(id, body, token) {
  return {
    url: `${API_URL}/api/comment/${id}`,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

// Deleta uma foto de acordo com o ID
export function PHOTO_DELETE(id, token) {
  return {
    url: `${API_URL}/api/photo/${id}`,
    options: {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function PASSWORD_LOST(body) {
  return {
    url: API_URL + '/api/password/lost',
    options: {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    }
  }
}

export function PASSWORD_RESET(body) {
  return {
    url: API_URL + '/api/password/reset',
    options: {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    }
  }
}

export function STATS_GET(token) {
  return {
    url: API_URL + '/api/stats',
    options: {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  }
}

// ================================================
// ================================================
// ================================================

// Solicita o token do usuario após autenticação
export function TOKEN_POST(body) {
  return {
    url: API_SOGYM_URL + "/session",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  };
}

// Verifica se o token é valido
export function TOKEN_VALIDATE_POST(token) {
    return {
      url: API_SOGYM_URL + "/validateToken",
      options: {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    };
}

//Solicita os dados do usuário após informar o token
export function USER_GET(token) {
  return {
    url: API_SOGYM_URL + "/session/",
    options: {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function EQUIPAMENTOS_GET(token) {
  return {
    url: API_SOGYM_URL + '/equipamento',
    options: {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + token,
        
      },
    }
  }
}

export function EQUIPAMENTOS_DELETE(id, token) {
  return {
    url: `${API_SOGYM_URL}/equipamento/${id}`,
    options: {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function EQUIPAMENTOS_POST(body, token) {
  return {
    url: `${API_SOGYM_URL}/equipamento`,
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function EQUIPAMENTOS_PUT(id, body, token) {
  return {
    url: `${API_SOGYM_URL}/equipamento/${id}`,
    options: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    },
  };
}

export function EXERCICIOS_GET(token) {
  return {
    url: API_SOGYM_URL + '/exercicio',
    options: {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + token,
        
      },
    }
  }
}

export function EXERCICIOS_DELETE(id, token) {
  return {
    url: `${API_SOGYM_URL}/exercicio/${id}`,
    options: {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  };
}

export function GRUPOS_GET(token) {
  return {
    url: API_SOGYM_URL + '/grupo',
    options: {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + token,
        
      },
    }
  }
}