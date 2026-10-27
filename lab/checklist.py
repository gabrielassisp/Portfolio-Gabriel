"""Pré-validação sintética de presença, sem documentos ou APIs reais."""
import json


def check(required, available):
    missing = sorted(set(required) - set(available))
    return dict(status='ready' if not missing else 'pending', missing=missing)


if __name__ == '__main__':
    required = ['formulario', 'identificacao', 'comprovante']
    print(json.dumps({'incomplete': check(required, ['formulario', 'identificacao']),
                      'complete': check(required, required)}, indent=2))
