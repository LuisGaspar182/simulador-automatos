// Retorna o ponto na borda do círculo de destino na direção de origem
export function pontoNaBorda(origem, destino, raio) {
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return destino;
  return {
    x: destino.x - (dx / dist) * raio,
    y: destino.y - (dy / dist) * raio,
  };
}

// Retorna o ponto de controle da curva de Bezier entre dois pontos
export function calcularCurvaBezier(origem, destino, curvatura) {
  const mx = (origem.x + destino.x) / 2;
  const my = (origem.y + destino.y) / 2;
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x: mx, y: my };
  // perpendicular normalizado (rotação 90° anti-horária)
  const px = -dy / dist;
  const py = dx / dist;
  return {
    x: mx + px * curvatura,
    y: my + py * curvatura,
  };
}

// Retorna os pontos da cubic Bezier para desenhar um self-loop acima do estado
export function pontosSelfLoop(centro, raio) {
  const { x, y } = centro;
  return [
    x - raio * 0.87, y - raio * 0.5,  // início (borda superior-esquerda)
    x - raio * 2.5,  y - raio * 3.2,  // cp1
    x + raio * 2.5,  y - raio * 3.2,  // cp2
    x + raio * 0.87, y - raio * 0.5,  // fim (borda superior-direita)
  ];
}

// Verifica se há transição nos dois sentidos entre origem e destino
export function ehBidirecional(afd, origem, destino) {
  if (origem === destino) return false;
  const temDireto = Object.values(afd.transicoes[origem] ?? {}).includes(destino);
  const temInverso = Object.values(afd.transicoes[destino] ?? {}).includes(origem);
  return temDireto && temInverso;
}

// Retorna a curvatura (com sinal) necessária para que a aresta desvie de estados
// intermediários próximos da linha reta origem→destino.
// Sinal positivo = curva no sentido anti-horário; negativo = horário.
// A direção é sempre "para longe" do estado intermediário detectado.
export function curvaturaNecessaria(posOrigem, posDestino, outrasPos, raio) {
  const dx = posDestino.x - posOrigem.x;
  const dy = posDestino.y - posOrigem.y;
  const dist2 = dx * dx + dy * dy;
  if (dist2 === 0) return 0;
  const dist = Math.sqrt(dist2);

  let maxAbs = 0;
  let sinal = 0;

  for (const pos of outrasPos) {
    const t = ((pos.x - posOrigem.x) * dx + (pos.y - posOrigem.y) * dy) / dist2;
    if (t <= 0.05 || t >= 0.95) continue;

    // Distância perpendicular com sinal (produto vetorial normalizado)
    // > 0: estado à esquerda de origem→destino (lado anti-horário)
    // < 0: estado à direita (lado horário)
    const perpSinalizado = (dx * (pos.y - posOrigem.y) - dy * (pos.x - posOrigem.x)) / dist;
    const perpDist = Math.abs(perpSinalizado);

    if (perpDist < raio * 3) {
      const necessario = (raio + 20) / (2 * t * (1 - t));
      if (necessario > maxAbs) {
        maxAbs = necessario;
        if (perpDist < 2) {
          // Estado quase sobre a linha: curvar para baixo por padrão
          // "Baixo" em coords de tela: cp.y cresce → perpUnit.y * curv > 0
          // perpUnit.y = dx/dist, logo sinal = Math.sign(dx)
          sinal = dx >= 0 ? 1 : -1;
        } else {
          // Curvar para o lado oposto ao estado
          sinal = perpSinalizado > 0 ? -1 : 1;
        }
      }
    }
  }

  return sinal * maxAbs;
}
