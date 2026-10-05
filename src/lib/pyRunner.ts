/**
 * Programme Python qui exécute le code de l'étudiant puis ses tests, et renvoie un compte rendu JSON.
 * Partagé entre l'appli (fil d'exécution Pyodide) et les tests automatiques (Pyodide sous Node).
 */
export const RUNNER = String.raw`
import ast, io, json, sys, traceback

def _ligne(e):
    """Numéro de ligne, dans le code de l'étudiant, où l'erreur s'est produite."""
    l = None
    for cadre in traceback.extract_tb(e.__traceback__):
        if cadre.filename == 'ton_code':
            l = cadre.lineno
    return l

def _message(e):
    noms = {
        'NameError': 'nom inconnu',
        'TypeError': 'erreur de type',
        'ZeroDivisionError': 'division par zéro',
        'IndentationError': "erreur d'indentation",
        'UnboundLocalError': 'variable utilisée avant sa définition',
        'RecursionError': 'trop de récursion',
        'ValueError': 'valeur invalide',
        'IndexError': 'indice hors limites',
        'AttributeError': 'attribut inconnu',
    }
    nom = type(e).__name__
    l = _ligne(e)
    return noms.get(nom, nom) + (f' (ligne {l})' if l else '') + f' : {e}'

def _obtenu(test, ns):
    """Pour « assert f(x) == v », précise la valeur réellement obtenue."""
    try:
        noeud = ast.parse(test).body[0]
        t = noeud.test
        if isinstance(t, ast.Compare) and len(t.ops) == 1 and isinstance(t.ops[0], ast.Eq):
            gauche = eval(compile(ast.Expression(t.left), 'test', 'eval'), ns)
            droite = eval(compile(ast.Expression(t.comparators[0]), 'test', 'eval'), ns)
            return f'obtenu {gauche!r}, attendu {droite!r}'
    except Exception:
        pass
    return 'le test échoue'

def _executer(code, tests_json):
    tests = json.loads(tests_json)
    res = {'erreur': None, 'tests': [], 'sortie': ''}
    sortie = io.StringIO()
    ancien = sys.stdout
    sys.stdout = sortie
    ns = {'__name__': '__main__'}
    try:
        exec('from typing import *\nimport math', ns)
        try:
            exec(compile(code, 'ton_code', 'exec'), ns)
        except SyntaxError as e:
            sorte = "Erreur d'indentation" if isinstance(e, IndentationError) else 'Erreur de syntaxe'
            res['erreur'] = f'{sorte} ligne {e.lineno} : {e.msg}'
        except AssertionError as e:
            l = _ligne(e)
            res['erreur'] = "Un assert de ton code échoue" + (f' (ligne {l})' if l else '')
        except Exception as e:
            res['erreur'] = _message(e)
        if res['erreur'] is None:
            for t in tests:
                try:
                    exec(t, ns)
                    res['tests'].append({'test': t, 'ok': True, 'message': ''})
                except AssertionError:
                    res['tests'].append({'test': t, 'ok': False, 'message': _obtenu(t, ns)})
                except Exception as e:
                    res['tests'].append({'test': t, 'ok': False, 'message': _message(e)})
    finally:
        sys.stdout = ancien
    res['sortie'] = sortie.getvalue()[-1500:]
    return json.dumps(res)
`
