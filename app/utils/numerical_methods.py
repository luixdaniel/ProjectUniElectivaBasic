def falsa_posicion(f, a, b, tol=1e-5, max_iter=100):
    """
    Método de Falsa Posición para encontrar la raíz de f(x) = 0.
    Sirve en el proyecto para predecir el día crítico de colapso de PQRS.
    """
    if f(a) * f(b) >= 0:
        raise ValueError("La función debe evaluar signos opuestos en los puntos a y b.")
    
    raiz = a
    for i in range(max_iter):
        # Fórmula de la Falsa Posición
        f_a = f(a)
        f_b = f(b)
        
        # Evitar división por cero
        if f_a - f_b == 0:
            break
            
        raiz = b - (f_b * (a - b)) / (f_a - f_b)
        f_raiz = f(raiz)
        
        if abs(f_raiz) < tol:
            break
            
        if f_a * f_raiz < 0:
            b = raiz
        else:
            a = raiz
            
    return raiz
